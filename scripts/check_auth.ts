import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function checkAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  console.log('URL:', url);
  console.log('Key length:', key.length);

  // Directly fetch auth users via Supabase Admin API endpoint using fetch
  try {
    const res = await fetch(`${url}/auth/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
      },
    });
    console.log('Response status:', res.status);
    const data = await res.json();
    if (data.users) {
      console.log(`Found ${data.users.length} users:`);
      data.users.forEach((u: any) => {
        console.log(` - ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at}`);
      });
    } else {
      console.log('Data:', data);
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

checkAuth();
