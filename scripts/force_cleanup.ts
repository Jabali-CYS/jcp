import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function run() {
  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  
  // Wipe everything in public schema that might cause issues.
  await adminClient.from('user_roles').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await adminClient.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const { data: users } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  for (const u of users?.users || []) {
    await adminClient.auth.admin.deleteUser(u.id, false);
    console.log('Deleted', u.email);
  }
}
run();
