import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function run() {
  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  
  const emails = ['trainee_a@test.local', 'trainee_b@test.local', 'trainer_a@test.local', 'trainer_b@test.local', 'trainer_c@test.local', 'admin@test.local'];
  for (const email of emails) {
    const { data } = await adminClient.from('profiles').select('id').eq('full_name', email.replace('@test.local', ''));
    // Actually auth.admin.deleteUser needs the ID. Let's just list all users and delete these.
    const { data: users } = await adminClient.auth.admin.listUsers();
    for (const u of users?.users || []) {
      if (emails.includes(u.email || '')) {
        await adminClient.auth.admin.deleteUser(u.id);
        console.log('Deleted', u.email);
      }
    }
  }
}
run();
