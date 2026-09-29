import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from './env'

export function createAdminClient() {
  const supabaseUrl = getServerEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseServiceRoleKey = getServerEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
