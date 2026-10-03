'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processApplication(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authentication & Authorization check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'غير مصرح به - يرجى تسجيل الدخول مجدداً' }

    // Check admin role via standard RLS-bound server client
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (roleData?.role !== 'admin') return { success: false, error: 'ليس لديك صلاحيات إدارة' }

    // 2. Input Validation
    const applicationId = formData.get('applicationId') as string
    const action = formData.get('action') as string // 'approve' or 'reject'
    const sessionId = formData.get('sessionId') as string // only required for approve

    if (!applicationId || !action) return { success: false, error: 'معلمات الطلب غير مكتملة' }
    if (action === 'approve' && (!sessionId || sessionId.length !== 36)) {
      return { success: false, error: 'يرجى اختيار مستوى الدورة / الجلسة التدريبية للموافقة' }
    }

    // Use admin client for privileged mutations
    const adminClient = createAdminClient()

    // 3. Verify application exists and is pending
    const { data: appData, error: appError } = await adminClient
      .from('applications')
      .select('profile_id, program_id, status')
      .eq('id', applicationId)
      .single()

    if (appError || !appData) return { success: false, error: 'لم يتم العثور على الطلب' }
    if (appData.status !== 'pending') return { success: false, error: 'تمت معالجة هذا الطلب مسبقاً' }

    if (action === 'reject') {
      const { error: updateError } = await adminClient
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)
      
      if (updateError) return { success: false, error: 'حدث خطأ أثناء رفض الطلب' }
    } else if (action === 'approve') {
      // 4. Verify session belongs to the program
      const { data: sessionData, error: sessionError } = await adminClient
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('program_id', appData.program_id)
        .single()
        
      if (sessionError || !sessionData) return { success: false, error: 'الجلسة المختارة لا تتبع لبرنامج هذا الطلب' }

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
          return { success: false, error: 'المتدرب مسجل بالفعل في جلسة تابعة لهذا البرنامج' }
        }
        return { success: false, error: 'حدث خطأ أثناء إنشاء التسجيل' }
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
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('processApplication error:', error)
    return { success: false, error: error?.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب' }
  }
}

import { redirect } from 'next/navigation'

/**
 * Safely finds a user's Auth UUID by email.
 * Supports pagination through GoTrue listUsers and falls back to chunked profile lookups.
 */
async function findUserIdByEmail(adminClient: ReturnType<typeof createAdminClient>, sanitizedEmail: string): Promise<string | null> {
  // Strategy 1: Paged lookup via GoTrue listUsers
  try {
    let page = 1
    const perPage = 100
    const maxPages = 20 // Safeguard: up to 2,000 auth users

    while (page <= maxPages) {
      const { data: usersData, error: listErr } = await adminClient.auth.admin.listUsers({ page, perPage })
      if (listErr || !usersData?.users) break

      const match = usersData.users.find(u => u.email?.trim().toLowerCase() === sanitizedEmail)
      if (match) return match.id

      if (usersData.users.length < perPage) break
      page++
    }
  } catch {
    // If listUsers fails due to auth schema inconsistencies, proceed to Strategy 2
  }

  // Strategy 2: Resilient chunked resolution across profiles
  try {
    const { data: profiles, error: pErr } = await adminClient
      .from('profiles')
      .select('id')
      .limit(2000)

    if (!pErr && profiles?.length) {
      // Process in small batches of 25 to respect network concurrency and avoid rate-limiting
      const chunkSize = 25
      for (let i = 0; i < profiles.length; i += chunkSize) {
        const chunk = profiles.slice(i, i + chunkSize)
        let foundInChunk: string | null = null

        await Promise.all(
          chunk.map(async (p) => {
            if (foundInChunk) return
            try {
              const { data, error } = await adminClient.auth.admin.getUserById(p.id)
              if (!error && data?.user?.email?.trim().toLowerCase() === sanitizedEmail) {
                foundInChunk = data.user.id
              }
            } catch {
              // Ignore single lookup failure
            }
          })
        )

        if (foundInChunk) return foundInChunk
      }
    }
  } catch {
    // Ignore error
  }

  return null
}

export async function makeAdmin(formData: FormData): Promise<void> {
  let redirectTarget: string | null = null

  try {
    const email = formData.get('email') as string

    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email.trim())) {
      redirectTarget = `/admin/users?error=${encodeURIComponent('صيغة البريد الإلكتروني غير صالحة')}`
      return
    }
    const sanitizedEmail = email.trim().toLowerCase()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirectTarget = '/login'
      return
    }

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (roleData?.role !== 'admin') {
      redirectTarget = '/dashboard'
      return
    }

    const adminClient = createAdminClient()

    // Resilient lookup
    const targetUserId = await findUserIdByEmail(adminClient, sanitizedEmail)
    if (!targetUserId) {
      redirectTarget = `/admin/users?error=${encodeURIComponent('لم يتم العثور على حساب مسجل بهذا البريد الإلكتروني')}`
      return
    }

    // Check if they already have an admin role
    const { data: existingRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (existingRole?.role === 'admin') {
      redirectTarget = `/admin/users?error=${encodeURIComponent('هذا الحساب يمتلك صلاحية مسؤول بالفعل')}`
      return
    }

    // Assign or upgrade role to admin
    const { error: upsertError } = await adminClient
      .from('user_roles')
      .upsert({ user_id: targetUserId, role: 'admin' }, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('Error assigning admin role:', upsertError)
      redirectTarget = `/admin/users?error=${encodeURIComponent('حدث خطأ أثناء ترقية الحساب')}`
      return
    }

    // Record audit log
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      action: 'role_promoted',
      target_table: 'user_roles',
      target_id: targetUserId,
      details: { role: 'admin', email: sanitizedEmail },
    })

    revalidatePath('/admin/users')
    redirectTarget = `/admin/users?success=${encodeURIComponent('تمت ترقية الحساب إلى مسؤول بنجاح')}`
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('makeAdmin unexpected error:', err)
    redirectTarget = `/admin/users?error=${encodeURIComponent('حدث خطأ غير متوقع في الخادم')}`
  } finally {
    if (redirectTarget) {
      redirect(redirectTarget)
    }
  }
}

export async function promoteUserById(formData: FormData): Promise<void> {
  let redirectTarget: string | null = null

  try {
    const userId = formData.get('userId') as string
    if (!userId) {
      redirectTarget = `/admin/users?error=${encodeURIComponent('معرف المستخدم مفقود')}`
      return
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirectTarget = '/login'
      return
    }

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (roleData?.role !== 'admin') {
      redirectTarget = '/dashboard'
      return
    }

    const adminClient = createAdminClient()

    const { error: upsertError } = await adminClient
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('Error assigning admin role:', upsertError)
      redirectTarget = `/admin/users?error=${encodeURIComponent('حدث خطأ أثناء ترقية الحساب')}`
      return
    }

    // Record audit log
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      action: 'role_promoted',
      target_table: 'user_roles',
      target_id: userId,
      details: { role: 'admin' },
    })

    revalidatePath('/admin/users')
    redirectTarget = `/admin/users?success=${encodeURIComponent('تمت ترقية الحساب إلى مسؤول بنجاح')}`
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('promoteUserById unexpected error:', err)
    redirectTarget = `/admin/users?error=${encodeURIComponent('حدث خطأ غير متوقع في الخادم')}`
  } finally {
    if (redirectTarget) {
      redirect(redirectTarget)
    }
  }
}

export async function demoteAdmin(formData: FormData): Promise<void> {
  let redirectTarget: string | null = null

  try {
    const userId = formData.get('userId') as string
    if (!userId) {
      redirectTarget = `/admin/users?error=${encodeURIComponent('معرف المستخدم مفقود')}`
      return
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirectTarget = '/login'
      return
    }

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (roleData?.role !== 'admin') {
      redirectTarget = '/dashboard'
      return
    }

    if (userId === user.id) {
      redirectTarget = `/admin/users?error=${encodeURIComponent('لا يمكنك إزالة صلاحية المسؤول عن حسابك الشخصي')}`
      return
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin')

    if (error) {
      if (error.code === 'P0001') {
        redirectTarget = `/admin/users?error=${encodeURIComponent('لا يمكن إزالة المسؤول الوحيد المتبقي في النظام')}`
        return
      }
      console.error('Error removing admin role:', error)
      redirectTarget = `/admin/users?error=${encodeURIComponent('حدث خطأ أثناء إزالة صلاحية المسؤول')}`
      return
    }

    revalidatePath('/admin/users')
    redirectTarget = `/admin/users?success=${encodeURIComponent('تمت إزالة صلاحية المسؤول بنجاح')}`
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('demoteAdmin unexpected error:', err)
    redirectTarget = `/admin/users?error=${encodeURIComponent('حدث خطأ غير متوقع في الخادم')}`
  } finally {
    if (redirectTarget) {
      redirect(redirectTarget)
    }
  }
}
