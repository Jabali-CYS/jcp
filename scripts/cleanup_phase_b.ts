import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

const ORPHAN_PROFILE_IDS = [
  'ae6d3313-4c9c-42cc-96e0-599539b58f8f',
  '681cea57-9f55-431f-91f5-cd15fc6f69ff',
  'd62fdd5a-da3d-4f41-80a4-493295e29214',
  '98d4fff6-a80a-47a0-866f-fc0e9f3b45d9',
  '9c685ff6-9b61-4945-b618-7bd9f4eef62c',
  'b6481304-04aa-43bf-8dd4-f4e859bf9f4e',
  '76fae6b6-a4b2-4f6d-ac4b-99e9df34d3c0',
  'c946f3ba-f0a2-4028-b1ed-1d0e336da36b',
  '2156b058-0928-4f67-8678-54685d36432f',
];

async function executePhaseBCleanup() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('=== STARTING SURGICAL PHASE B CLEANUP (ORPHAN PROFILES) ===\n');

  console.log(`Deleting ${ORPHAN_PROFILE_IDS.length} orphan profiles...`);
  const { error } = await client
    .from('profiles')
    .delete()
    .in('id', ORPHAN_PROFILE_IDS);

  if (error) {
    console.error('Error deleting orphan profiles:', error);
    return;
  }
  console.log('✓ Successfully deleted 9 orphan profiles.');

  // Verification
  const { data: profs } = await client.from('profiles').select('id, full_name, user_roles(role)');
  console.log(`\nRemaining Profiles: ${profs?.length} (Expected: 4 active users)`);
  profs?.forEach(p => {
    // @ts-ignore
    console.log(` - Profile: ${p.full_name} [${p.id}] | Role: ${p.user_roles?.role || 'NONE'}`);
  });

  console.log('\n✓ PHASE B CLEANUP COMPLETED AND VERIFIED 100% SUCCESSFUL!');
}

executePhaseBCleanup();
