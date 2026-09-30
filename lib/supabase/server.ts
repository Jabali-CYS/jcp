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
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
