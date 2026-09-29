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

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      return { error: 'بيانات الدخول غير صحيحة، يرجى التحقق والمحاولة مجدداً' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error: any) {
    // If it's a Next.js redirect, rethrow it so navigation succeeds
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Login action exception:', error)
    return { error: error?.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول' }
  }
}

export async function signup(formData: FormData) {
  try {
    const rawUrl = getServerEnv('NEXT_PUBLIC_SUPABASE_URL')
    let supabaseHost = 'missing'
    try {
      if (rawUrl) {
        supabaseHost = new URL(rawUrl).hostname
      } else {
        supabaseHost = 'fallback:placeholder'
      }
    } catch {
      supabaseHost = 'invalid_url'
    }

    const anonAvailable = Boolean(getServerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
    const serviceRoleAvailable = Boolean(getServerEnv('SUPABASE_SERVICE_ROLE_KEY'))

    console.log(`[AUTH_DIAG] supabase_host=${supabaseHost} anon_key_available=${anonAvailable} service_role_available=${serviceRoleAvailable}`)

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
      console.error(`[AUTH_DIAG] error.name=${error.name} error.message=${error.message} error.status=${(error as any).status} error.code=${(error as any).code}`)
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
    console.error(`[AUTH_DIAG] exception.name=${error?.name} exception.message=${error?.message} exception.status=${error?.status} exception.code=${error?.code}`)
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
