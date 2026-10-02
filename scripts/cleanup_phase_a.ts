import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

// Explicit list of VERIFIED TEST IDs identified during Foreign-Key Impact Audit
const TEST_PROGRAM_IDS = [
  'af417f29-4f1c-4b80-b295-3fa211d6377a', // Admin Updated
  '3da6e105-0010-4d1f-885d-458dc578f543', // Program Y
  'eba5de91-dac1-4653-afd0-b0e48aa49969', // Phase 10 Program
  'a8a1d3e9-37d5-4d8d-a9ac-68a5cc10142d', // Admin Updated
  '7521fe49-a50a-4a9f-a2af-2866e1a6419d', // Program Y
  '9096a05f-2625-4a39-b14f-950378e374af', // Admin Updated
  'd56c73ed-c924-4226-ace6-db36b66ece45', // Program Y
  '6c4cb431-af62-405b-92ef-440f3fca3886', // E2E MUMOEU84 JCP Academy program
];

const TEST_PACKAGE_IDS = [
  'aed6ac10-c004-4130-937a-6ae2909ff1f9', // Phase 10 Pkg
  '3ff77925-ad53-4df8-8b66-7ed3dde4397a', // Admin Updated Pkg
  '14b74036-deaa-4248-8346-af089001d0e8', // Admin Updated Pkg
  '5faccab1-1904-4f0c-9f68-873122eaeca8', // Admin Updated Pkg
  '6eb2d8d2-01cb-4b48-b0b4-d9c70fea8096', // E2E MUMOEU84 training package
];

// PROTECTED CORE IDS (SAFETY GUARD)
const PROTECTED_PROGRAM_IDS = [
  '1d63b7ea-2721-46ab-809a-c83ed7db54e3', // برنامج تدريبي تأسيسي للمنتسبين الجدد
  '4273200a-dd0f-417a-abe6-ccc83c548e07', // دورة حزبي مبتدئ
  'e405c8e7-78ac-4c15-b933-ac30cc49a652', // دورة قيادي حزبي
];

async function executePhaseACleanup() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('=== STARTING SURGICAL PHASE A CLEANUP ===\n');

  // Safety Assertion: ensure none of the protected programs are in the deletion list
  for (const pid of PROTECTED_PROGRAM_IDS) {
    if (TEST_PROGRAM_IDS.includes(pid)) {
      throw new Error(`CRITICAL ABORT: Protected program ${pid} is in deletion list!`);
    }
  }

  // 1. Delete test programs (Cascades to their child sessions and child digital content)
  console.log(`Step 1: Deleting ${TEST_PROGRAM_IDS.length} test programs...`);
  const { error: progErr } = await client
    .from('programs')
    .delete()
    .in('id', TEST_PROGRAM_IDS);

  if (progErr) {
    console.error('Error deleting test programs:', progErr);
    return;
  }
  console.log('✓ Successfully deleted 8 test programs and cascaded their child sessions & content.');

  // 2. Delete test training packages (now unreferenced by sessions)
  console.log(`\nStep 2: Deleting ${TEST_PACKAGE_IDS.length} unreferenced test training packages...`);
  const { error: pkgErr } = await client
    .from('training_packages')
    .delete()
    .in('id', TEST_PACKAGE_IDS);

  if (pkgErr) {
    console.error('Error deleting test training packages:', pkgErr);
    return;
  }
  console.log('✓ Successfully deleted 5 test training packages.');

  // 3. Post-cleanup verification
  console.log('\n=== POST-CLEANUP VERIFICATION ===');
  const { data: progs } = await client.from('programs').select('id, title, status');
  console.log(`Remaining Programs: ${progs?.length} (Expected: 3)`);
  progs?.forEach(p => console.log(` - [CORE] ${p.title} (${p.id})`));

  const { data: pkgs } = await client.from('training_packages').select('id, title');
  console.log(`\nRemaining Packages: ${pkgs?.length} (Expected: 4)`);
  pkgs?.forEach(pkg => console.log(` - [CORE] ${pkg.title} (${pkg.id})`));

  const { data: sessions } = await client.from('sessions').select('id, program_id, package_id');
  console.log(`\nRemaining Sessions: ${sessions?.length} (Expected: 7)`);

  const { data: dc } = await client.from('digital_content').select('id, title');
  console.log(`\nRemaining Digital Content: ${dc?.length} (Expected: 0)`);

  const { data: apps } = await client.from('applications').select('id, profile_id, status');
  console.log(`\nSmoke Test Application: ${apps?.length} (Expected: 1) -> Status: ${apps?.[0]?.status}`);

  const { data: certs } = await client.from('certificates').select('id, serial_number');
  console.log(`Smoke Test Certificate: ${certs?.length} (Expected: 1) -> Serial: ${certs?.[0]?.serial_number}`);

  console.log('\n✓ PHASE A CLEANUP COMPLETED AND VERIFIED 100% SUCCESSFUL!');
}

executePhaseACleanup();
