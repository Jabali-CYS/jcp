'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  return user
}

export async function createSession(formData: FormData): Promise<void> {
  const user = await verifyAdminAuth()

  const programId = formData.get('programId') as string
  const packageId = formData.get('packageId') as string
  const sessionDate = formData.get('sessionDate') as string
  let trainerId = formData.get('trainerId') as string | null

  if (!programId || !packageId || !sessionDate) {
    throw new Error('بيانات غير صالحة')
  }

  if (trainerId === '') trainerId = null

  const adminClient = createAdminClient()

  // Verify program exists
  const { data: program, error: progErr } = await adminClient.from('programs').select('id').eq('id', programId).single()
  if (progErr || !program) throw new Error('البرنامج غير موجود')

  // Verify package exists
  const { data: pkg, error: pkgErr } = await adminClient.from('training_packages').select('id').eq('id', packageId).single()
  if (pkgErr || !pkg) throw new Error('الحقيبة التدريبية غير موجودة')

  // Verify trainer role if assigned
  if (trainerId) {
    const { data: trainerRole, error: trErr } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', trainerId)
      .eq('role', 'trainer')
      .single()
    if (trErr || !trainerRole) throw new Error('المستخدم المحدد ليس مدرباً معتمداً')
  }

  const { error } = await adminClient
    .from('sessions')
    .insert({
      program_id: programId,
      package_id: packageId,
      session_date: new Date(sessionDate).toISOString(),
      trainer_id: trainerId
    })

  if (error) {
    console.error('Error creating session:', error)
    throw new Error('حدث خطأ أثناء إنشاء الجلسة')
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create_session',
    target_table: 'sessions',
    details: { program_id: programId, package_id: packageId, trainer_id: trainerId }
  })

  revalidatePath(`/admin/programs/${programId}`)
}

export async function updateSessionAssignment(formData: FormData): Promise<void> {
  const user = await verifyAdminAuth()

  const sessionId = formData.get('sessionId') as string
  const programId = formData.get('programId') as string
  const sessionDate = formData.get('sessionDate') as string
  let trainerId = formData.get('trainerId') as string | null

  if (!sessionId || !sessionDate || !programId) {
    throw new Error('بيانات غير صالحة')
  }

  if (trainerId === '') trainerId = null

  const adminClient = createAdminClient()

  // Verify session exists
  const { data: session, error: sessErr } = await adminClient.from('sessions').select('id').eq('id', sessionId).single()
  if (sessErr || !session) throw new Error('الجلسة غير موجودة')

  // Verify trainer role if assigned
  if (trainerId) {
    const { data: trainerRole, error: trErr } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', trainerId)
      .eq('role', 'trainer')
      .single()
    if (trErr || !trainerRole) throw new Error('المستخدم المحدد ليس مدرباً معتمداً')
  }

  const { error } = await adminClient
    .from('sessions')
    .update({
      session_date: new Date(sessionDate).toISOString(),
      trainer_id: trainerId
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session:', error)
    throw new Error('حدث خطأ أثناء تحديث الجلسة')
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update_session',
    target_table: 'sessions',
    target_id: sessionId,
    details: { new_trainer_id: trainerId, new_date: sessionDate }
  })

  revalidatePath(`/admin/programs/${programId}`)
}
