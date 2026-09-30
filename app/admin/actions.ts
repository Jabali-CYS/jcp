'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processApplication(formData: FormData): Promise<void> {
  // 1. Authentication & Authorization check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check admin role via standard RLS-bound server client
  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  // 2. Input Validation
  const applicationId = formData.get('applicationId') as string
  const action = formData.get('action') as string // 'approve' or 'reject'
  const sessionId = formData.get('sessionId') as string // only required for approve

  if (!applicationId || !action) throw new Error('معلمات مفقودة')
  if (action === 'approve' && (!sessionId || sessionId.length !== 36)) {
    throw new Error('يجب اختيار جلسة تدريبية لإنشاء التسجيل')
  }

  // Use admin client for privileged mutations
  const adminClient = createAdminClient()

  // 3. Verify application exists and is pending
  const { data: appData, error: appError } = await adminClient
    .from('applications')
    .select('profile_id, program_id, status')
    .eq('id', applicationId)
    .single()

  if (appError || !appData) throw new Error('لم يتم العثور على الطلب')
  if (appData.status !== 'pending') throw new Error('تمت معالجة هذا الطلب مسبقاً')

  if (action === 'reject') {
    const { error: updateError } = await adminClient
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)
    
    if (updateError) throw new Error('حدث خطأ أثناء الرفض')
  } else if (action === 'approve') {
    // 4. Verify session belongs to the program
    const { data: sessionData, error: sessionError } = await adminClient
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('program_id', appData.program_id)
      .single()
      
    if (sessionError || !sessionData) throw new Error('الجلسة المختارة لا تتبع لبرنامج هذا الطلب')

    // 5. Create Enrollment
    const { data: newEnrollment, error: enrollError } = await adminClient
      .from('enrollments')
      .insert({
        profile_id: appData.profile_id,
        session_id: sessionId,
        status: 'active'
      })
      .select('id')
      .single()

    if (enrollError) {
      if (enrollError.code === '23505') { // Unique constraint violation
         throw new Error('المتدرب مسجل بالفعل في جلسة تابعة لهذا البرنامج')
      }
      throw new Error('حدث خطأ أثناء إنشاء التسجيل')
    }

    // 6. Update Application Status
    const { error: updateError } = await adminClient
      .from('applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Failed to update application status after enrollment creation:', updateError)
    }

    // 7. Audit log for enrollment creation.
    //    actor_id is user.id from the authenticated server session — never from the client.
    //    Inserted only after enrollment creation is confirmed.
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      action: 'enrollment_created',
      target_table: 'enrollments',
      target_id: newEnrollment.id,
      details: {
        profile_id: appData.profile_id,
        session_id: sessionId,
        application_id: applicationId,
      },
    })
  }


  revalidatePath('/admin')
}

export async function makeAdmin(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  if (!email || !email.includes('@')) {
    throw new Error('البريد الإلكتروني غير صالح')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  const adminClient = createAdminClient()

  // Use Auth Admin API to find user by email
  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers()
  if (usersError) throw new Error('خطأ في جلب بيانات المستخدمين')

  const targetUser = usersData.users.find(u => u.email === email)
  if (!targetUser) {
    throw new Error('لم يتم العثور على حساب بهذا البريد الإلكتروني')
  }

  // Check if they already have an admin role
  const { data: existingRole } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUser.id)
    .maybeSingle()

  if (existingRole?.role === 'admin') {
    return
  }

  // Assign or upgrade role to admin
  const { error: upsertError } = await adminClient
    .from('user_roles')
    .upsert({ user_id: targetUser.id, role: 'admin' }, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('Error assigning admin role:', upsertError)
    throw new Error('حدث خطأ أثناء ترقية الحساب')
  }

  revalidatePath('/admin/users')
}

export async function demoteAdmin(formData: FormData): Promise<void> {
  const userId = formData.get('userId') as string
  if (!userId) {
    throw new Error('معرف المستخدم مفقود')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'admin')

  if (error) {
    if (error.code === 'P0001') {
      throw new Error('لا يمكن إزالة المسؤول الوحيد المتبقي في النظام')
    }
    console.error('Error removing admin role:', error)
    throw new Error('حدث خطأ أثناء إزالة صلاحية المسؤول')
  }

  revalidatePath('/admin/users')
}
