'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProgram(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  const title = formData.get('title') as string
  if (!title || title.trim() === '') throw new Error('يرجى إدخال عنوان البرنامج')

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('programs')
    .insert({ title: title.trim(), status: 'draft' })

  if (error) {
    console.error('Error creating program:', error)
    throw new Error('حدث خطأ أثناء إنشاء البرنامج')
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create_program',
    target_table: 'programs',
    details: { title: title.trim() }
  })

  revalidatePath('/admin/programs')
}

export async function updateProgramStatus(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  const programId = formData.get('programId') as string
  const status = formData.get('status') as string

  if (!programId || !['draft', 'active', 'archived'].includes(status)) {
    throw new Error('بيانات غير صالحة')
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('programs')
    .update({ status })
    .eq('id', programId)

  if (error) {
    console.error('Error updating program status:', error)
    throw new Error('حدث خطأ أثناء تحديث حالة البرنامج')
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update_program_status',
    target_table: 'programs',
    target_id: programId,
    details: { new_status: status }
  })

  revalidatePath('/admin/programs')
}
