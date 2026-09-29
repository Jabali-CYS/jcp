import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function run() {
  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  
  const ts = Date.now();
  const { data: uAdmin } = await adminClient.auth.admin.createUser({ email: `admin_${ts}@test.local`, password: 'password123', email_confirm: true });
  await adminClient.from('profiles').insert({ id: uAdmin.user!.id, full_name: 'Admin' });
  await adminClient.from('user_roles').insert({ user_id: uAdmin.user!.id, role: 'admin' });

  const { data: uTrainee } = await adminClient.auth.admin.createUser({ email: `trainee_${ts}@test.local`, password: 'password123', email_confirm: true });
  await adminClient.from('profiles').insert({ id: uTrainee.user!.id, full_name: 'Trainee' });
  await adminClient.from('user_roles').insert({ user_id: uTrainee.user!.id, role: 'trainee' });

  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  await userClient.auth.signInWithPassword({ email: `admin_${ts}@test.local`, password: 'password123' });

  console.log("Admins before promote:", await adminClient.from('user_roles').select('*').eq('role', 'admin'));

  const { error: tpad5Err } = await userClient.from('user_roles').update({ role: 'admin' }).eq('user_id', uTrainee.user!.id);
  console.log("tpad5Err:", tpad5Err);
  
  console.log("Admins after promote:", await adminClient.from('user_roles').select('*').eq('role', 'admin'));

  const { error: tplock3Err } = await userClient.from('user_roles').delete().eq('user_id', uTrainee.user!.id);
  console.log("tplock3Err:", tplock3Err);

  console.log("Admins after delete trainee:", await adminClient.from('user_roles').select('*').eq('role', 'admin'));

  const { error: tplock1Err } = await userClient.from('user_roles').delete().eq('user_id', uAdmin.user!.id);
  console.log("tplock1Err:", tplock1Err);
}
run();
