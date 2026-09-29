import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in Browser / Client Components.
 * This client is safe to use in the browser as it only exposes the public URL and anon key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
