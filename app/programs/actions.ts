'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'يجب تسجيل الدخول لتقديم طلب التحاق' }
  }

  const programId = formData.get('programId') as string

  // Server-side validation
  if (!programId || typeof programId !== 'string' || programId.length !== 36) {
    return { error: 'معرف البرنامج غير صالح' }
  }

  // Check if user already applied to this program
  const { data: existingApp } = await supabase
    .from('applications')
    .select('id, status')
    .eq('profile_id', user.id)
    .eq('program_id', programId)
    .maybeSingle()

  if (existingApp) {
    if (existingApp.status === 'rejected') {
      // Allow re-applying: Reset status to pending
      const adminClient = createAdminClient()
      const { error: updateError } = await adminClient
        .from('applications')
        .update({
          status: 'pending',
          created_at: new Date().toISOString(),
          local_leadership_approval: false,
        })
        .eq('id', existingApp.id)

      if (updateError) {
        console.error('Re-apply update error:', updateError)
        return { error: 'حدث خطأ أثناء إعادة تقديم الطلب. يرجى المحاولة لاحقاً.' }
      }

      revalidatePath('/programs')
      revalidatePath(`/programs/${programId}`)
      revalidatePath('/dashboard')
      revalidatePath('/admin')
      return { success: true, reapply: true }
    } else if (existingApp.status === 'approved') {
      return { error: 'تم قبولك مسبقاً في هذا البرنامج.' }
    } else {
      return { error: 'لديك طلب قيد المراجعة بالفعل لهذا البرنامج.' }
    }
  }

  // Attempt to insert. RLS will block if status or local_leadership_approval is injected
  const { error } = await supabase
    .from('applications')
    .insert({
      profile_id: user.id, // Derived server-side from session
      program_id: programId,
      status: 'pending', // Hardcoded safe default
      local_leadership_approval: false, // Hardcoded safe default
    })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'لقد قمت بتقديم طلب لهذا البرنامج مسبقاً' }
    }
    console.error('Application submission error:', error)
    return { error: 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة لاحقاً.' }
  }

  revalidatePath('/programs')
  revalidatePath(`/programs/${programId}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  
  return { success: true }
}
