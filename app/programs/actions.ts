'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
  revalidatePath('/dashboard')
  
  return { success: true }
}
