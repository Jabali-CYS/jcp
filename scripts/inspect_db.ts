import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function inspectDetailed() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('--- DIGITAL CONTENT ---');
  const { data: contents } = await client.from('digital_content').select('id, title, program_id, file_path');
  contents?.forEach(c => console.log(` - ID: ${c.id} | Title: ${c.title} | ProgramID: ${c.program_id} | Path: ${c.file_path}`));

  console.log('\n--- USERS DETAILS (via profiles & user_roles) ---');
  const { data: profiles } = await client.from('profiles').select('*, user_roles(role)');
  profiles?.forEach(p => {
    console.log(` - Profile ID: ${p.id} | Name: ${p.full_name} | Role: ${p.user_roles ? JSON.stringify(p.user_roles) : 'NONE'} | Created: ${p.created_at}`);
  });

  console.log('\n--- SESSIONS WITH PROGRAM TITLES ---');
  const { data: sessions } = await client.from('sessions').select('id, session_date, programs(id, title), training_packages(id, title)');
  sessions?.forEach(s => {
    // @ts-ignore
    console.log(` - Session ID: ${s.id} | Prog: ${s.programs?.title} | Pkg: ${s.training_packages?.title} | Date: ${s.session_date}`);
  });
}

inspectDetailed();
