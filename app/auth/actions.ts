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

    const { error } = await supabase.auth.signInWithPassword(data)

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

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error: any) {
    // If it's a Next.js redirect, rethrow it so navigation succeeds
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
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
      try {
        if (getServerEnv('SUPABASE_SERVICE_ROLE_KEY')) {
          const adminClient = createAdminClient()
          await adminClient.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
          })
          await adminClient.from('user_roles').insert({
            user_id: data.user.id,
            role: 'trainee',
          })
        } else {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
          })
          await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role: 'trainee',
          })
        }
      } catch (profileErr) {
        console.warn('Profile/role assignment notice:', profileErr)
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

export async function logout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Logout error:', error)
  }
}
