import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServerEnv } from './env'

/**
 * Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Manages secure cookies.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = getServerEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co'
  const supabaseAnonKey = getServerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'placeholder-key'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
