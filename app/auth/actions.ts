'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerEnv } from '@/lib/supabase/env'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    if (!data.email || !data.password) {
      return { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      const code = (error as any).code || ''
      const status = (error as any).status

      if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        return { error: 'البريد الإلكتروني لم يتم تأكيده بعد. يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.' }
      }

      if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
        return { error: 'بيانات الدخول غير صحيحة، يرجى التحقق من البريد الإلكتروني وكلمة المرور.' }
      }

      if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
        return { error: 'تم تجاوز الحد المسموح به من المحاولات، يرجى الانتظار قليلاً قبل المحاولة مجدداً.' }
      }

      return { error: 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً.' }
    }

    let userRole = 'trainee'
    // Self-healing check: Ensure authenticated user has a profile and trainee role if missing
    if (authData?.user) {
      try {
        const userId = authData.user.id
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (getServerEnv('SUPABASE_SERVICE_ROLE_KEY')) {
          const adminClient = createAdminClient()
          const fullName = authData.user.user_metadata?.full_name || 'المتدرب'
          if (!existingProfile) {
            await adminClient.from('profiles').upsert({
              id: userId,
              full_name: fullName,
            }, { onConflict: 'id' })
          }

          // Guard against demoting admins/trainers: only insert trainee if user has NO role at all
          const { data: existingRole } = await adminClient
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle()

          if (!existingRole) {
            await adminClient.from('user_roles').insert({
              user_id: userId,
              role: 'trainee',
            })
          } else {
            userRole = existingRole.role
          }
        }
      } catch (healingErr) {
        console.warn('Profile/role self-healing notice:', healingErr)
      }
    }

    revalidatePath('/', 'layout')
    if (userRole === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Login action exception:', error)
    return { error: 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً.' }
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password || !fullName) {
      return { error: 'جميع الحقول مطلوبة' }
    }

    if (password.length < 8) {
      return { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      const code = (error as any).code || ''
      const status = (error as any).status

      if (status === 429 || code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
        return { error: 'تم تجاوز الحد المسموح به لإرسال رسائل التأكيد، يرجى الانتظار قليلاً قبل إعادة المحاولة.' }
      }
      return { error: error.message }
    }

    if (data.user) {
      // Supabase Email Enumeration Protection:
      // When a user already exists, Supabase returns data.user with an empty identities array []
      if (data.user.identities && data.user.identities.length === 0) {
        return { error: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استعادة كلمة المرور.' }
      }

      let adminClient: ReturnType<typeof createAdminClient> | null = null
      try {
        if (getServerEnv('SUPABASE_SERVICE_ROLE_KEY')) {
          adminClient = createAdminClient()
          const { error: pErr } = await adminClient.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
          }, { onConflict: 'id' })
          if (pErr) {
            console.error('Profile upsert error:', pErr.message, pErr.details)
            throw new Error(`Profile setup failed: ${pErr.message}`)
          }

          const { error: rErr } = await adminClient.from('user_roles').upsert({
            user_id: data.user.id,
            role: 'trainee',
          }, { onConflict: 'user_id' })
          if (rErr) {
            console.error('Role upsert error:', rErr.message, rErr.details)
            throw new Error(`Role setup failed: ${rErr.message}`)
          }
        } else {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
          }, { onConflict: 'id' })
          await supabase.from('user_roles').upsert({
            user_id: data.user.id,
            role: 'trainee',
          }, { onConflict: 'user_id' })
        }
      } catch (profileErr: any) {
        console.error('Transactional rollback during signup:', profileErr)
        // Rollback Auth user if profile or role creation fails
        if (adminClient && data.user.id) {
          try {
            await adminClient.auth.admin.deleteUser(data.user.id)
          } catch (rollbackErr) {
            console.error('Rollback failure:', rollbackErr)
          }
        }
        return { error: `حدث خطأ أثناء إعداد الحساب (${profileErr?.message || 'يرجى المحاولة لاحقاً'})` }
      }

      // Check if email confirmation is required (session is null)
      if (!data.session) {
        return {
          success: true,
          emailConfirmationRequired: true,
          message: 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.',
        }
      }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Signup action exception:', error)
    return { error: error?.message || 'حدث خطأ أثناء إنشاء الحساب' }
  }
}

export async function forgotPassword(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = (formData.get('email') as string)?.trim()

    if (!email) {
      return { error: 'يرجى إدخال البريد الإلكتروني' }
    }

    const origin = getServerEnv('NEXT_PUBLIC_SITE_URL') || 'https://jcpacademy.com'
    const redirectTo = `${origin}/auth/callback?next=/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      const status = (error as any).status
      const code = (error as any).code || ''
      const msg = error.message?.toLowerCase() || ''

      if (status === 429 || code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
        return { error: 'تم تجاوز الحد المسموح به لإرسال الرسائل، يرجى الانتظار قليلاً قبل المحاولة مجدداً.' }
      }

      console.error('Reset password notice:', error.message)
    }

    // Always return safe success to prevent user enumeration
    return {
      success: true,
      message: 'إذا كان البريد مسجلاً لدينا، فستصلك رسالة تحتوي على رابط استعادة كلمة المرور.',
    }
  } catch (error: any) {
    console.error('Forgot password exception:', error)
    return { error: 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.' }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
      return { error: 'جميع الحقول مطلوبة' }
    }

    if (password.length < 8) {
      return { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
    }

    if (password !== confirmPassword) {
      return { error: 'كلمتا المرور غير متطابقتين' }
    }

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('auth session missing') || msg.includes('jwt')) {
        return { error: 'انتهت صلاحية جلسة استعادة كلمة المرور. يرجى طلب رابط جديد.' }
      }
      return { error: error.message || 'فشل تحديث كلمة المرور، يرجى المحاولة مجدداً.' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Update password exception:', error)
    return { error: 'حدث خطأ أثناء تحديث كلمة المرور، يرجى المحاولة لاحقاً.' }
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Logout error:', error)
  }
}
