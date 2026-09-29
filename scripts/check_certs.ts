import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function check() {
  const { data, count } = await supabase.from('certificates').select('*', { count: 'exact' })
  console.log(`Found ${count} certificates.`)
  if (data && data.length > 0) {
    console.log(data)
  }
}

check()
