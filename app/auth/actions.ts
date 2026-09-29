'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for simplicity
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Invalid login credentials' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    return { error: 'All fields are required' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const adminClient = createAdminClient()

    // 1. Create the profile securely
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Note: In a production app, you might want to handle rollback or retry
    }

    // 2. Assign the default role (trainee) securely
    // Client cannot override this because it's hardcoded on the server
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: 'trainee',
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
