import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => 
  new Promise((resolve) => rl.question(query, resolve));

function reportQueryError(label: string, error: unknown) {
  console.log(`${label}: ERROR\n  Reason: ${((error as Error)?.message) || JSON.stringify(error)}`);
}

import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function runTests() {
  console.log('--- JCP Academy Runtime Security Harness ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('All credentials are required in .env.local. Exiting.');
    process.exit(1);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log('\n[1] TEST ACCOUNT CREATION...');
  const testPassword = 'TestPassword123!@#';
  
  const createTestUser = async (email: string, name: string, role: string) => {
    const { data, error } = await adminClient.auth.admin.createUser({ email, password: testPassword, email_confirm: true });
    if (error || !data.user) throw new Error(`Failed to create ${email}: ${error?.message}`);
    const uid = data.user.id;
    await adminClient.from('profiles').insert([{ id: uid, full_name: name }]);
    await adminClient.from('user_roles').insert([{ user_id: uid, role }]);
    return uid;
  };

  const timestamp = Date.now();
  let uidTraineeA, uidTraineeB, uidTrainerA, uidTrainerB, uidAdmin;
  try {
    uidTraineeA = await createTestUser(`trainee_a_${timestamp}@test.local`, 'Trainee A', 'trainee');
    uidTraineeB = await createTestUser(`trainee_b_${timestamp}@test.local`, 'Trainee B', 'trainee');
    uidTrainerA = await createTestUser(`trainer_a_${timestamp}@test.local`, 'Trainer A', 'trainer');
    uidTrainerB = await createTestUser(`trainer_b_${timestamp}@test.local`, 'Trainer B', 'trainer');
    uidAdmin = await createTestUser(`admin_${timestamp}@test.local`, 'Admin User', 'admin');
  } catch (err: unknown) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const makeClient = async (email: string) => {
    const client = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await client.auth.signInWithPassword({ email, password: testPassword });
    if (error) throw new Error(`Login failed for ${email}: ${error.message}`);
    return client;
  };

  let traineeAClient, traineeBClient, trainerAClient, trainerBClient, adminUserClient;
  try {
    traineeAClient = await makeClient(`trainee_a_${timestamp}@test.local`);
    traineeBClient = await makeClient(`trainee_b_${timestamp}@test.local`);
    trainerAClient = await makeClient(`trainer_a_${timestamp}@test.local`);
    trainerBClient = await makeClient(`trainer_b_${timestamp}@test.local`);
    adminUserClient = await makeClient(`admin_${timestamp}@test.local`);
  } catch (err: any) {
    console.error('AUTH PREREQUISITE FAILED:', err.message);
    process.exit(1);
  }

  console.log('Test accounts created and authenticated.');

  // SETUP TEST DATA
  const { data: program } = await adminClient.from('programs').insert({ title: 'Phase 10 Program', status: 'active' }).select().single();
  const { data: pkg } = await adminClient.from('training_packages').insert({ title: 'Phase 10 Pkg' }).select().single();
  
  // Session assigned to Trainer A
  const { data: sessionA } = await adminClient.from('sessions').insert({ 
    program_id: program?.id, package_id: pkg?.id, trainer_id: uidTrainerA, session_date: new Date().toISOString() 
  }).select().single();
  
  // Session assigned to Trainer B
  const { data: sessionB } = await adminClient.from('sessions').insert({ 
    program_id: program?.id, package_id: pkg?.id, trainer_id: uidTrainerB, session_date: new Date().toISOString() 
  }).select().single();

  // Enroll Trainee A in Session A
  await adminClient.from('enrollments').insert({ profile_id: uidTraineeA, session_id: sessionA?.id, status: 'active' });
  // Enroll Trainee B in Session B
  await adminClient.from('enrollments').insert({ profile_id: uidTraineeB, session_id: sessionB?.id, status: 'active' });

  // Add Attendance for Trainee B in Session B
  const enrB = await adminClient.from('enrollments').select('id').eq('profile_id', uidTraineeB).single();
  await adminClient.from('attendance').insert({ enrollment_id: enrB.data?.id, session_id: sessionB?.id, status: 'present' });

  console.log('\n[2] ROLE ESCALATION TESTS...');
  
  // R1: Trainee cannot assign self trainer
  const { data: r1Data, error: r1Err } = await traineeAClient.from('user_roles').update({ role: 'trainer' }).eq('user_id', uidTraineeA).select('user_id');
  console.log(`R1: ${r1Err ? 'ERROR' : r1Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Escalated)'}`);

  // R2: Trainee cannot assign self admin
  const { data: r2Data, error: r2Err } = await traineeAClient.from('user_roles').update({ role: 'admin' }).eq('user_id', uidTraineeA).select('user_id');
  console.log(`R2: ${r2Err ? 'ERROR' : r2Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Escalated)'}`);

  // R3: Trainer cannot assign self admin
  const { data: r3Data, error: r3Err } = await trainerAClient.from('user_roles').update({ role: 'admin' }).eq('user_id', uidTrainerA).select('user_id');
  console.log(`R3: ${r3Err ? 'ERROR' : r3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Escalated)'}`);

  // R4: Non-admin cannot modify another user's roles
  const { data: r4Data, error: r4Err } = await trainerAClient.from('user_roles').update({ role: 'trainee' }).eq('user_id', uidAdmin).select('user_id');
  console.log(`R4: ${r4Err ? 'ERROR' : r4Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Modified)'}`);

  // R5: Admin role management works where explicitly supported
  const { data: r5Data, error: r5Err } = await adminUserClient.from('user_roles').update({ role: 'trainer' }).eq('user_id', uidTraineeB).select('user_id');
  console.log(`R5: ${r5Err ? 'ERROR' : r5Data?.length > 0 ? 'PASS (Admin managed role)' : 'FAIL (Admin denied)'}`);

  console.log('\n[3] TRAINER ISOLATION TESTS...');

  // TR1: Trainer A can access authorized session
  const { data: tr1Data, error: tr1Err } = await trainerAClient.from('sessions').select('*').eq('id', sessionA?.id);
  console.log(`TR1: ${tr1Err ? 'ERROR' : tr1Data && tr1Data.length > 0 ? 'PASS (Authorized session accessed)' : 'FAIL (Denied)'}`);

  // TR2: Trainer A cannot access Trainer B's unauthorized session enrollments
  const { data: tr2Data, error: tr2Err } = await trainerAClient.from('enrollments').select('*').eq('session_id', sessionB?.id);
  console.log(`TR2: ${tr2Err ? 'ERROR' : tr2Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Unauthorized enrollment accessed)'}`);

  // TR3: Trainer A cannot access unrelated trainee data (Attendance of Trainee B in Session B)
  const { data: tr3Data, error: tr3Err } = await trainerAClient.from('attendance').select('*').eq('session_id', sessionB?.id);
  console.log(`TR3: ${tr3Err ? 'ERROR' : tr3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Unauthorized attendance accessed)'}`);

  // TR4: Trainer A can perform authorized attendance operations
  const { data: enrA } = await adminClient.from('enrollments').select('id').eq('profile_id', uidTraineeA).single();
  const { data: tr4Data, error: tr4Err } = await trainerAClient.from('attendance').insert({ enrollment_id: enrA?.id, session_id: sessionA?.id, status: 'present' }).select('id');
  console.log(`TR4: ${tr4Err ? 'ERROR' : tr4Data && tr4Data.length > 0 ? 'PASS (Authorized write)' : 'FAIL (Write denied)'}`);

  // TR5: Trainer A cannot modify program-level administrative data
  const { data: tr5Data, error: tr5Err } = await trainerAClient.from('programs').update({ title: 'Hacked Program' }).eq('id', program?.id).select('id');
  console.log(`TR5: ${tr5Err ? 'ERROR' : tr5Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Unauthorized write)'}`);

  console.log('\n[4] ADMIN MUTATION TESTS...');
  // AD1: Admin can read applications
  const { error: ad1Err } = await adminUserClient.from('applications').select('id');
  console.log(`AD1: ${ad1Err ? 'ERROR' : 'PASS (Admin read)'}`);

  console.log('\n[5] PHASE 12: APPLICATION WORKFLOW TESTS...');

  // A1: Trainee creates own application
  const { data: a1Data, error: a1Err } = await traineeAClient.from('applications').insert({
    profile_id: uidTraineeA,
    program_id: program?.id,
    status: 'pending',
    local_leadership_approval: false
  }).select('id').single();
  console.log(`A1: ${a1Err ? 'ERROR (' + a1Err.message + ')' : a1Data ? 'PASS (Created application)' : 'FAIL'}`);

  // A2: Trainee cannot create application for another profile
  const { data: a2Data, error: a2Err } = await traineeAClient.from('applications').insert({
    profile_id: uidTraineeB,
    program_id: program?.id,
    status: 'pending',
    local_leadership_approval: false
  }).select('id');
  console.log(`A2: ${a2Err && a2Err.code === '42501' ? 'PASS (Denied as expected)' : a2Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Created for another or unexpected error: ' + (a2Err?.message || 'unknown') + ')'}`);

  // A3/A4: Trainee cannot self-approve / modify status
  const { data: a3Data, error: a3Err } = await traineeAClient.from('applications').update({ status: 'approved' }).eq('id', a1Data?.id).select('id');
  console.log(`A3/A4: ${a3Err ? 'ERROR' : a3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Modified status)'}`);

  // Admin Review Flow (AD2, AD3, AD4, AD5)
  // Admin creates an application for Trainee B to reject
  const { data: bApp } = await adminClient.from('applications').insert({
    profile_id: uidTraineeB,
    program_id: program?.id,
    status: 'pending',
    local_leadership_approval: false
  }).select('id').single();

  // AD3: Admin rejects valid application
  const { data: ad3Data, error: ad3Err } = await adminUserClient.from('applications').update({ status: 'rejected' }).eq('id', bApp?.id).select('id');
  console.log(`AD3: ${ad3Err ? 'ERROR' : ad3Data && ad3Data.length > 0 ? 'PASS (Rejected)' : 'FAIL'}`);

  // AD2/AD4: Admin approves valid application and creates enrollment
  const { data: ad2Data, error: ad2Err } = await adminUserClient.from('applications').update({ status: 'approved' }).eq('id', a1Data?.id).select('id');
  const { data: adEnrollData, error: adEnrollErr } = await adminUserClient.from('enrollments').insert({
    profile_id: uidTraineeA,
    session_id: sessionB?.id, // Trainee A is already enrolled in session A, so let's use session B or we get duplicate
    status: 'active'
  }).select('id');
  console.log(`AD2/AD4: ${(ad2Err || adEnrollErr) ? 'ERROR' : (ad2Data && adEnrollData) ? 'PASS (Approved and Enrolled)' : 'FAIL'}`);

  // AD5: Admin cannot create invalid duplicate enrollment
  const { error: adEnrollDupErr } = await adminUserClient.from('enrollments').insert({
    profile_id: uidTraineeA,
    session_id: sessionB?.id, // duplicate
    status: 'active'
  }).select('id');
  console.log(`AD5: ${adEnrollDupErr && adEnrollDupErr.code === '23505' ? 'PASS (Duplicate prevented)' : 'FAIL'}`);

  console.log('\n[6] PHASE 12: ENROLLMENT ISOLATION TESTS...');

  // E1: Trainee can read own enrollment
  const { data: e1Data, error: e1Err } = await traineeAClient.from('enrollments').select('id').eq('profile_id', uidTraineeA);
  console.log(`E1: ${e1Err ? 'ERROR' : e1Data && e1Data.length > 0 ? 'PASS (Read own enrollment)' : 'FAIL'}`);

  // E2: Trainee cannot read another enrollment
  const { data: e2Data, error: e2Err } = await traineeBClient!.from('enrollments').select('id').eq('profile_id', uidTraineeA);
  console.log(`E2: ${e2Err ? 'ERROR' : e2Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Read another enrollment)'}`);

  // E3: Trainee cannot create enrollment
  const { data: e3Data, error: e3Err } = await traineeAClient.from('enrollments').insert({
    profile_id: uidTraineeA,
    session_id: sessionB?.id,
    status: 'active'
  }).select('id');
  console.log(`E3: ${e3Err && e3Err.code === '42501' ? 'PASS (Denied as expected)' : e3Err ? 'PASS (Denied by RLS)' : e3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Created enrollment)'}`);

  // E4: Trainer cannot arbitrarily create enrollment
  const { data: e4Data, error: e4Err } = await trainerAClient.from('enrollments').insert({
    profile_id: uidTraineeB,
    session_id: sessionA?.id,
    status: 'active'
  }).select('id');
  console.log(`E4: ${e4Err && e4Err.code === '42501' ? 'PASS (Denied as expected)' : e4Err ? 'PASS (Denied by RLS)' : e4Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Created enrollment)'}`);

  // AD4: Admin can manage programs
  const { data: ad4Data, error: ad4Err } = await adminUserClient.from('programs').update({ title: 'Admin Updated' }).eq('id', program?.id).select('id');
  console.log(`AD4: ${ad4Err ? 'ERROR' : ad4Data && ad4Data.length > 0 ? 'PASS (Admin updated)' : 'FAIL (Admin update denied)'}`);

  // AD5: Admin can manage training packages
  const { data: ad5Data, error: ad5Err } = await adminUserClient.from('training_packages').update({ title: 'Admin Updated Pkg' }).eq('id', pkg?.id).select('id');
  console.log(`AD5: ${ad5Err ? 'ERROR' : ad5Data && ad5Data.length > 0 ? 'PASS (Admin updated)' : 'FAIL (Admin update denied)'}`);

  // AD7: Non-admin cannot perform these administrative mutations (tested partially in TR5/R3, let's test Trainee A modifying session)
  const { data: ad7Data, error: ad7Err } = await traineeAClient.from('sessions').update({ session_date: new Date().toISOString() }).eq('id', sessionA?.id).select('id');
  console.log(`AD7: ${ad7Err ? 'ERROR' : ad7Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL (Trainee modified session)'}`);

  console.log('\n[7] TRAINER PROFILE ACCESS TESTS (TP1-TP8)...');

  // TP1 Trainer A reads authorized trainee name
  const { data: tp1Data, error: tp1Err } = await trainerAClient.from('trainer_trainee_names').select('*').eq('id', uidTraineeA);
  console.log(`TP1: ${tp1Err ? 'ERROR (' + tp1Err.message + ')' : tp1Data && tp1Data.length > 0 ? 'PASS (Authorized name read)' : 'FAIL (Denied)'}`);

  // TP2 Trainer A cannot read Trainer B's trainee
  const { data: tp2Data, error: tp2Err } = await trainerAClient.from('trainer_trainee_names').select('*').eq('id', uidTraineeB);
  console.log(`TP2: ${tp2Err ? 'ERROR' : tp2Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Read unauthorized trainee)'}`);

  // TP3 Trainer A cannot read unauthorized trainee (Trainee C - creating fake uid)
  const { data: tp3Data, error: tp3Err } = await trainerAClient.from('trainer_trainee_names').select('*').eq('id', '00000000-0000-0000-0000-000000000000');
  console.log(`TP3: ${tp3Err ? 'ERROR' : tp3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Read unauthorized trainee)'}`);

  // TP4 Trainee cannot access trainer-only trainee identity endpoint
  const { data: tp4Data, error: tp4Err } = await traineeAClient.from('trainer_trainee_names').select('*');
  console.log(`TP4: ${tp4Err ? 'ERROR' : tp4Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Trainee accessed view)'}`);

  // TP5 Trainer cannot obtain age
  const { error: tp5Err } = await trainerAClient.from('trainer_trainee_names').select('age').eq('id', uidTraineeA);
  console.log(`TP5: ${tp5Err ? 'PASS (Denied/Error as expected)' : 'FAIL (Age accessed!)'}`);

  // TP6 Trainer cannot obtain party_affiliation
  const { error: tp6Err } = await trainerAClient.from('trainer_trainee_names').select('party_affiliation').eq('id', uidTraineeA);
  console.log(`TP6: ${tp6Err ? 'PASS (Denied/Error as expected)' : 'FAIL (Party affiliation accessed!)'}`);

  // TP7 Trainer cannot enumerate profiles
  const { data: tp7Data, error: tp7Err } = await trainerAClient.from('trainer_trainee_names').select('*');
  // It should only return 1 row (Trainee A) and not all rows
  console.log(`TP7: ${tp7Err ? 'ERROR' : tp7Data?.length === 1 ? 'PASS (Only authorized returned)' : 'FAIL (Enumerated other profiles)'}`);

  // TP8 Admin behavior remains correct (Admin can still query profiles normally)
  const { data: tp8Data, error: tp8Err } = await adminUserClient.from('profiles').select('id');
  console.log(`TP8: ${tp8Err ? 'ERROR' : tp8Data && tp8Data.length >= 2 ? 'PASS (Admin read profiles)' : 'FAIL (Admin profile access broken)'}`);

  console.log('\n[8] PHASE 13: EVALUATION RLS VERIFICATION TESTS...');

  // Setup evaluations
  // Trainee A is in Session A (Trainer A). Trainee B is in Session B (Trainer B).
  const enrA_res = await adminClient.from('enrollments').select('id').eq('profile_id', uidTraineeA).eq('session_id', sessionA?.id).single();
  const enrB_res = await adminClient.from('enrollments').select('id').eq('profile_id', uidTraineeB).eq('session_id', sessionB?.id).single();
  
  // Need to ensure enrollments exist for these specific sessions
  let enrA_id = enrA_res.data?.id;
  if (!enrA_id) {
    const { data: newEnrA } = await adminClient.from('enrollments').insert({ profile_id: uidTraineeA, session_id: sessionA?.id, status: 'active' }).select('id').single();
    enrA_id = newEnrA?.id;
  }
  let enrB_id = enrB_res.data?.id;
  if (!enrB_id) {
    const { data: newEnrB } = await adminClient.from('enrollments').insert({ profile_id: uidTraineeB, session_id: sessionB?.id, status: 'active' }).select('id').single();
    enrB_id = newEnrB?.id;
  }

  // EV1: Trainer creates evaluation for trainee in own session
  const { data: ev1Data, error: ev1Err } = await trainerAClient.from('evaluations').insert({
    enrollment_id: enrA_id,
    type: 'post',
    feedback: 'Excellent progress'
  }).select('id');
  console.log(`EV1: ${ev1Err ? 'ERROR (' + ev1Err.message + ')' : ev1Data && ev1Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);
  const evA_id = ev1Data?.[0]?.id;

  // EV2: Trainer reads evaluation in own session
  const { data: ev2Data, error: ev2Err } = await trainerAClient.from('evaluations').select('id').eq('id', evA_id);
  console.log(`EV2: ${ev2Err ? 'ERROR (' + ev2Err.message + ')' : ev2Data && ev2Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // EV3: Trainer reads another trainer evaluation
  const { data: ev3Data, error: ev3Err } = await trainerAClient.from('evaluations').select('id').eq('enrollment_id', enrB_id);
  console.log(`EV3: ${ev3Err ? 'ERROR' : ev3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Read another trainer eval)'}`);

  // EV4: Trainer creates evaluation for another trainer session
  const { data: ev4Data, error: ev4Err } = await trainerAClient.from('evaluations').insert({
    enrollment_id: enrB_id,
    type: 'post',
    feedback: 'Hacked eval'
  }).select('id');
  console.log(`EV4: ${ev4Err && ev4Err.code === '42501' ? 'PASS (Denied)' : ev4Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Created for another trainer or unexpected err: ' + ev4Err?.message + ')'}`);

  // EV5: Trainer creates evaluation for non-enrolled trainee (using random UUID)
  const { data: ev5Data, error: ev5Err } = await trainerAClient.from('evaluations').insert({
    enrollment_id: '00000000-0000-0000-0000-000000000000',
    type: 'post',
    feedback: 'Fake eval'
  }).select('id');
  console.log(`EV5: ${(ev5Err && (ev5Err.code === '42501' || ev5Err.code === '23503')) ? 'PASS (Denied)' : ev5Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Created for non-enrolled)'}`);

  // EV6: Trainee reads own evaluation
  const { data: ev6Data, error: ev6Err } = await traineeAClient.from('evaluations').select('id').eq('id', evA_id);
  console.log(`EV6: ${ev6Err ? 'ERROR (' + ev6Err.message + ')' : ev6Data && ev6Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // EV7: Trainee reads another trainee evaluation
  const { data: ev7Data, error: ev7Err } = await traineeAClient.from('evaluations').select('id').eq('enrollment_id', enrB_id);
  console.log(`EV7: ${ev7Err ? 'ERROR' : ev7Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Read another trainee eval)'}`);

  // EV8: Trainee creates evaluation
  const { data: ev8Data, error: ev8Err } = await traineeAClient.from('evaluations').insert({
    enrollment_id: enrA_id,
    type: 'pre',
    feedback: 'Self eval'
  }).select('id');
  console.log(`EV8: ${ev8Err && ev8Err.code === '42501' ? 'PASS (Denied)' : ev8Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Created own eval or unexpected err)'}`);

  // EV9: Trainee updates evaluation
  const { data: ev9Data, error: ev9Err } = await traineeAClient.from('evaluations').update({ feedback: 'Hacked' }).eq('id', evA_id).select('id');
  console.log(`EV9: ${ev9Err ? 'ERROR' : ev9Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Updated own eval)'}`);

  // EV10: Trainer B updates Trainer A's evaluation
  const { data: ev10Data, error: ev10Err } = await trainerBClient.from('evaluations').update({ feedback: 'Hacked by B' }).eq('id', evA_id).select('id');
  console.log(`EV10: ${ev10Err ? 'ERROR' : ev10Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Updated another trainer eval)'}`);

  // EV11: Admin access
  const { data: ev11Data, error: ev11Err } = await adminUserClient.from('evaluations').select('id').eq('id', evA_id);
  console.log(`EV11: ${ev11Err ? 'ERROR (' + ev11Err.message + ')' : ev11Data && ev11Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // EV12: Trainer delete evaluation
  const { data: ev12Data, error: ev12Err } = await trainerAClient.from('evaluations').delete().eq('id', evA_id).select('id');
  console.log(`EV12: ${ev12Err ? 'ERROR' : ev12Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Trainer deleted eval)'}`);

  // EV13: Trainee delete evaluation
  const { data: ev13Data, error: ev13Err } = await traineeAClient.from('evaluations').delete().eq('id', evA_id).select('id');
  console.log(`EV13: ${ev13Err ? 'ERROR' : ev13Data?.length === 0 ? 'PASS (Denied)' : 'FAIL (Trainee deleted eval)'}`);

  // EV14: Admin delete evaluation
  const { data: ev14Data, error: ev14Err } = await adminUserClient.from('evaluations').delete().eq('id', evA_id).select('id');
  console.log(`EV14: ${ev14Err ? 'ERROR (' + ev14Err.message + ')' : ev14Data && ev14Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  console.log('\n[9] PHASE 13B: ATTENDANCE RLS VERIFICATION TESTS...');
  
  // Clean up any existing attendance for these enrollments
  await adminClient.from('attendance').delete().in('enrollment_id', [enrA_id, enrB_id]);

  // AT3: Trainer creates valid attendance
  const { data: at3Data, error: at3Err } = await trainerAClient.from('attendance').insert({
    session_id: sessionA?.id,
    enrollment_id: enrA_id,
    status: 'present'
  }).select('id');
  console.log(`AT3: ${at3Err ? 'ERROR (' + at3Err.message + ')' : at3Data && at3Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);
  const attA_id = at3Data?.[0]?.id;

  // AT1: Trainer reads own attendance
  const { data: at1Data, error: at1Err } = await trainerAClient.from('attendance').select('id').eq('id', attA_id);
  console.log(`AT1: ${at1Err ? 'ERROR (' + at1Err.message + ')' : at1Data && at1Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // AT2: Trainer reads another trainer attendance
  const { data: at2Data, error: at2Err } = await trainerAClient.from('attendance').select('id').eq('enrollment_id', enrB_id);
  console.log(`AT2: ${at2Err ? 'ERROR' : at2Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT4: Primary IDOR: Cross-session enrollment injection (Trainer A, Session A, Enrollment B)
  const { data: at4Data, error: at4Err } = await trainerAClient.from('attendance').insert({
    session_id: sessionA?.id,
    enrollment_id: enrB_id,
    status: 'present'
  }).select('id');
  console.log(`AT4: ${at4Err && at4Err.code === '42501' ? 'PASS (Denied as expected)' : at4Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT5: Reverse mismatch (Trainer A, Session B, Enrollment A)
  const { data: at5Data, error: at5Err } = await trainerAClient.from('attendance').insert({
    session_id: sessionB?.id,
    enrollment_id: enrA_id,
    status: 'present'
  }).select('id');
  console.log(`AT5: ${at5Err && at5Err.code === '42501' ? 'PASS (Denied as expected)' : at5Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT6: Non-enrolled invalid enrollment
  const { data: at6Data, error: at6Err } = await trainerAClient.from('attendance').insert({
    session_id: sessionA?.id,
    enrollment_id: '00000000-0000-0000-0000-000000000000',
    status: 'present'
  }).select('id');
  console.log(`AT6: ${(at6Err && (at6Err.code === '42501' || at6Err.code === '23503')) ? 'PASS (Denied as expected)' : at6Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT7: Valid Trainer Update
  const { data: at7Data, error: at7Err } = await trainerAClient.from('attendance').update({ status: 'absent' }).eq('id', attA_id).select('id');
  console.log(`AT7: ${at7Err ? 'ERROR (' + at7Err.message + ')' : at7Data && at7Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // AT8: Cross-trainer update
  const { data: at8Data, error: at8Err } = await trainerBClient.from('attendance').update({ status: 'present' }).eq('id', attA_id).select('id');
  console.log(`AT8: ${at8Err ? 'ERROR' : at8Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT9: Update rebinding test (Change enrollment_id to B)
  const { data: at9Data, error: at9Err } = await trainerAClient.from('attendance').update({ enrollment_id: enrB_id }).eq('id', attA_id).select('id');
  console.log(`AT9: ${at9Err && at9Err.code === '42501' ? 'PASS (Denied as expected)' : at9Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT10: Trainer delete attendance
  const { data: at10Data, error: at10Err } = await trainerAClient.from('attendance').delete().eq('id', attA_id).select('id');
  console.log(`AT10: ${at10Err ? 'ERROR' : at10Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT11: Trainee reads own attendance
  const { data: at11Data, error: at11Err } = await traineeAClient.from('attendance').select('id').eq('id', attA_id);
  console.log(`AT11: ${at11Err ? 'ERROR' : at11Data && at11Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // AT12: Trainee isolation (reads Trainee B)
  const { data: at12Data, error: at12Err } = await traineeAClient.from('attendance').select('id').eq('enrollment_id', enrB_id);
  console.log(`AT12: ${at12Err ? 'ERROR' : at12Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT13: Trainee creates attendance
  const { data: at13Data, error: at13Err } = await traineeAClient.from('attendance').insert({
    session_id: sessionA?.id,
    enrollment_id: enrA_id,
    status: 'present'
  }).select('id');
  console.log(`AT13: ${at13Err && at13Err.code === '42501' ? 'PASS (Denied as expected)' : at13Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT14: Trainee updates attendance
  const { data: at14Data, error: at14Err } = await traineeAClient.from('attendance').update({ status: 'present' }).eq('id', attA_id).select('id');
  console.log(`AT14: ${at14Err ? 'ERROR' : at14Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT15: Trainee deletes attendance
  const { data: at15Data, error: at15Err } = await traineeAClient.from('attendance').delete().eq('id', attA_id).select('id');
  console.log(`AT15: ${at15Err ? 'ERROR' : at15Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL'}`);

  // AT16: Admin reads
  const { data: at16Data, error: at16Err } = await adminUserClient.from('attendance').select('id').eq('id', attA_id);
  console.log(`AT16: ${at16Err ? 'ERROR' : at16Data && at16Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // AT17: Admin creates/updates test record
  const { data: at17Data, error: at17Err } = await adminUserClient.from('attendance').update({ status: 'present' }).eq('id', attA_id).select('id');
  console.log(`AT17: ${at17Err ? 'ERROR' : at17Data && at17Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // AT18: Admin deletes test record
  const { data: at18Data, error: at18Err } = await adminUserClient.from('attendance').delete().eq('id', attA_id).select('id');
  console.log(`AT18: ${at18Err ? 'ERROR' : at18Data && at18Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  console.log('\n[11] PHASE 13D: ATTENDANCE UI WORKFLOW TESTS...');
  
  // AT-UI-1: Trainer A can read attendance for own session
  const { data: atu1Data, error: atu1Err } = await trainerAClient.from('attendance').select('id').eq('session_id', sessionA?.id);
  console.log(`AT-UI-1: ${atu1Err ? 'ERROR' : 'PASS (Authorized)'}`);

  // AT-UI-2: Trainer A can create/update attendance for own session
  const { data: atu2Data, error: atu2Err } = await trainerAClient.from('attendance').insert({ session_id: sessionA?.id, enrollment_id: enrA_id, status: 'present' }).select('id');
  console.log(`AT-UI-2: ${atu2Err && atu2Err.code !== '23505' ? 'ERROR' : 'PASS (Authorized or duplicate handled)'}`);

  // AT-UI-3: Trainer A cannot read Trainer B attendance
  const { data: atu3Data, error: atu3Err } = await trainerAClient.from('attendance').select('id').eq('session_id', sessionB?.id);
  console.log(`AT-UI-3: ${atu3Err ? 'ERROR' : atu3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-4: Trainer A cannot create attendance for Trainer B session
  const { data: atu4Data, error: atu4Err } = await trainerAClient.from('attendance').insert({ session_id: sessionB?.id, enrollment_id: enrB_id, status: 'present' }).select('id');
  console.log(`AT-UI-4: ${atu4Err && atu4Err.code === '42501' ? 'PASS (Denied)' : atu4Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-5: Trainer A cannot use own session_id with Trainer B enrollment_id
  const { data: atu5Data, error: atu5Err } = await trainerAClient.from('attendance').insert({ session_id: sessionA?.id, enrollment_id: enrB_id, status: 'present' }).select('id');
  console.log(`AT-UI-5: ${atu5Err && atu5Err.code === '42501' ? 'PASS (Denied)' : atu5Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-6: Trainer A cannot update an attendance record belonging to Trainer B
  // We need an attendance record for Trainer B.
  const { data: attB } = await adminClient.from('attendance').insert({ session_id: sessionB?.id, enrollment_id: enrB_id, status: 'absent' }).select('id').single();
  const { data: atu6Data, error: atu6Err } = await trainerAClient.from('attendance').update({ status: 'present' }).eq('id', attB?.id).select('id');
  console.log(`AT-UI-6: ${atu6Err ? 'ERROR' : atu6Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-7: Trainer A cannot rebind attendance to another session/enrollment
  const { data: attA } = await adminClient.from('attendance').select('id').eq('enrollment_id', enrA_id).single();
  const { data: atu7Data, error: atu7Err } = await trainerAClient.from('attendance').update({ session_id: sessionB?.id }).eq('id', attA?.id).select('id');
  console.log(`AT-UI-7: ${atu7Err && atu7Err.code === '42501' ? 'PASS (Denied)' : atu7Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-8: Trainee A can read own attendance
  const { data: atu8Data, error: atu8Err } = await traineeAClient.from('attendance').select('id').eq('enrollment_id', enrA_id);
  console.log(`AT-UI-8: ${atu8Err ? 'ERROR' : atu8Data && atu8Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // AT-UI-9: Trainee A cannot read Trainee B attendance
  const { data: atu9Data, error: atu9Err } = await traineeAClient.from('attendance').select('id').eq('enrollment_id', enrB_id);
  console.log(`AT-UI-9: ${atu9Err ? 'ERROR' : atu9Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-10: Trainee A cannot insert attendance
  const { data: atu10Data, error: atu10Err } = await traineeAClient.from('attendance').insert({ session_id: sessionA?.id, enrollment_id: enrA_id, status: 'present' }).select('id');
  console.log(`AT-UI-10: ${atu10Err && atu10Err.code === '42501' ? 'PASS (Denied)' : atu10Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-11: Trainee A cannot update attendance
  const { data: atu11Data, error: atu11Err } = await traineeAClient.from('attendance').update({ status: 'absent' }).eq('id', attA?.id).select('id');
  console.log(`AT-UI-11: ${atu11Err ? 'ERROR' : atu11Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-12: Trainee A cannot delete attendance
  const { data: atu12Data, error: atu12Err } = await traineeAClient.from('attendance').delete().eq('id', attA?.id).select('id');
  console.log(`AT-UI-12: ${atu12Err ? 'ERROR' : atu12Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // AT-UI-13: Trainer cannot delete attendance unless an existing policy explicitly permits it
  const { data: atu13Data, error: atu13Err } = await trainerAClient.from('attendance').delete().eq('id', attA?.id).select('id');
  console.log(`AT-UI-13: ${atu13Err ? 'ERROR' : atu13Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL (Deleted)'}`);

  // AT-UI-14: Admin behavior remains unchanged
  const { data: atu14Data, error: atu14Err } = await adminUserClient.from('attendance').select('id').eq('id', attA?.id);
  console.log(`AT-UI-14: ${atu14Err ? 'ERROR' : atu14Data && atu14Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);


  console.log('\n[12] PHASE 13E: EVALUATION UI WORKFLOW TESTS...');

  // EV-UI-1: Trainer A can create evaluation for trainee in own session
  const { data: evu1Data, error: evu1Err } = await trainerAClient.from('evaluations').insert({ enrollment_id: enrA_id, type: 'pre', feedback: 'Test UI Eval' }).select('id');
  console.log(`EV-UI-1: ${evu1Err ? 'ERROR' : evu1Data && evu1Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);
  const testEvId = evu1Data?.[0]?.id || evA_id;

  // EV-UI-2: Trainer A can read evaluation in own session
  const { data: evu2Data, error: evu2Err } = await trainerAClient.from('evaluations').select('id').eq('id', testEvId);
  console.log(`EV-UI-2: ${evu2Err ? 'ERROR' : evu2Data && evu2Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // EV-UI-3: Trainer A cannot read Trainer B's evaluation
  const { data: evB } = await adminClient.from('evaluations').insert({ enrollment_id: enrB_id, type: 'pre', feedback: 'B Eval' }).select('id').single();
  const { data: evu3Data, error: evu3Err } = await trainerAClient.from('evaluations').select('id').eq('id', evB?.id);
  console.log(`EV-UI-3: ${evu3Err ? 'ERROR' : evu3Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-4: Trainer A cannot create evaluation for Trainer B session
  const { data: evu4Data, error: evu4Err } = await trainerAClient.from('evaluations').insert({ enrollment_id: enrB_id, type: 'post', feedback: 'Hack' }).select('id');
  console.log(`EV-UI-4: ${evu4Err && evu4Err.code === '42501' ? 'PASS (Denied)' : evu4Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-5: Trainer A cannot create evaluation for a trainee not enrolled in the target session
  const { data: evu5Data, error: evu5Err } = await trainerAClient.from('evaluations').insert({ enrollment_id: '00000000-0000-0000-0000-000000000000', type: 'pre', feedback: 'Hack' }).select('id');
  console.log(`EV-UI-5: ${(evu5Err && (evu5Err.code === '42501' || evu5Err.code === '23503')) ? 'PASS (Denied)' : evu5Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-6: Trainer A can update an evaluation in own session
  const { data: evu6Data, error: evu6Err } = await trainerAClient.from('evaluations').update({ feedback: 'Updated' }).eq('id', testEvId).select('id');
  console.log(`EV-UI-6: ${evu6Err ? 'ERROR' : evu6Data && evu6Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // EV-UI-7: Trainer A cannot update Trainer B's evaluation
  const { data: evu7Data, error: evu7Err } = await trainerAClient.from('evaluations').update({ feedback: 'Hacked' }).eq('id', evB?.id).select('id');
  console.log(`EV-UI-7: ${evu7Err ? 'ERROR' : evu7Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-8: Trainee A can read own evaluation
  const { data: evu8Data, error: evu8Err } = await traineeAClient.from('evaluations').select('id').eq('id', testEvId);
  console.log(`EV-UI-8: ${evu8Err ? 'ERROR' : evu8Data && evu8Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  // EV-UI-9: Trainee A cannot read Trainee B evaluation
  const { data: evu9Data, error: evu9Err } = await traineeAClient.from('evaluations').select('id').eq('id', evB?.id);
  console.log(`EV-UI-9: ${evu9Err ? 'ERROR' : evu9Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-10: Trainee A cannot create evaluation
  const { data: evu10Data, error: evu10Err } = await traineeAClient.from('evaluations').insert({ enrollment_id: enrA_id, type: 'post', feedback: 'Self' }).select('id');
  console.log(`EV-UI-10: ${evu10Err && evu10Err.code === '42501' ? 'PASS (Denied)' : evu10Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-11: Trainee A cannot update evaluation
  const { data: evu11Data, error: evu11Err } = await traineeAClient.from('evaluations').update({ feedback: 'Hack' }).eq('id', testEvId).select('id');
  console.log(`EV-UI-11: ${evu11Err ? 'ERROR' : evu11Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-12: Trainee A cannot delete evaluation
  const { data: evu12Data, error: evu12Err } = await traineeAClient.from('evaluations').delete().eq('id', testEvId).select('id');
  console.log(`EV-UI-12: ${evu12Err ? 'ERROR' : evu12Data?.length === 0 ? 'PASS (Denied)' : 'FAIL'}`);

  // EV-UI-13: Trainer cannot delete evaluation unless an existing policy explicitly permits it
  const { data: evu13Data, error: evu13Err } = await trainerAClient.from('evaluations').delete().eq('id', testEvId).select('id');
  console.log(`EV-UI-13: ${evu13Err ? 'ERROR' : evu13Data?.length === 0 ? 'PASS (Denied as expected)' : 'FAIL (Deleted)'}`);

  // EV-UI-14: Admin behavior remains unchanged
  const { data: evu14Data, error: evu14Err } = await adminUserClient.from('evaluations').select('id').eq('id', evB?.id);
  console.log(`EV-UI-14: ${evu14Err ? 'ERROR' : evu14Data && evu14Data.length > 0 ? 'PASS (Authorized)' : 'FAIL'}`);

  console.log('\n[13] PHASE 13F: DIGITAL CONTENT UI WORKFLOW TESTS...');

  // Setup Digital Content
  const { data: dcX } = await adminClient.from('digital_content').insert({
    program_id: program?.id,
    title: 'Program X Content 1',
    file_url: 'http://example.com/file1.pdf'
  }).select('id').single();

  const { data: dcX2 } = await adminClient.from('digital_content').insert({
    program_id: program?.id,
    title: 'Program X Content 2',
    file_url: 'http://example.com/file2.pdf'
  }).select('id').single();

  // Create Program Y and Session for Trainer B
  const { data: programY } = await adminClient.from('programs').insert({ title: 'Program Y', status: 'active' }).select().single();
  const { data: sessionB2 } = await adminClient.from('sessions').insert({ 
    program_id: programY?.id, package_id: pkg?.id, trainer_id: uidTrainerB, session_date: new Date().toISOString() 
  }).select().single();
  
  const { data: dcY } = await adminClient.from('digital_content').insert({
    program_id: programY?.id,
    title: 'Program Y Content',
    file_url: 'http://example.com/fileY.pdf'
  }).select('id').single();

  // DC-R1: Trainer A can read content for Program X when Trainer A owns a session for Program X
  const { data: dcr1Data, error: dcr1Err } = await trainerAClient.from('digital_content').select('id').eq('id', dcX?.id);
  console.log(`DC-R1: ${dcr1Err ? 'ERROR' : dcr1Data && dcr1Data.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // DC-R2: Trainer A cannot read content for Program Y when Trainer A has no session for Program Y
  const { data: dcr2Data, error: dcr2Err } = await trainerAClient.from('digital_content').select('id').eq('id', dcY?.id);
  console.log(`DC-R2: ${dcr2Err ? 'ERROR' : dcr2Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // DC-R3: Trainer B cannot read Program X content when Trainer B has no session for Program X
  // Wait, Trainer B actually DOES have a session for Program X! In setup: sessionB = program X, pkg, trainer B!
  // Let me check if Trainer B has a session for Program X... Yes, sessionB has `program_id: program?.id`.
  // I need to create a trainer C or just accept that Trainer B has access to Program X.
  // Actually, let's create a Program Z for Trainer C or just create a Trainer C and give them no sessions.
  const uidTrainerC = await createTestUser(`trainer_c_${timestamp}@test.local`, 'Trainer C', 'trainer');
  const trainerCClient = await makeClient(`trainer_c_${timestamp}@test.local`);

  const { data: dcr3Data, error: dcr3Err } = await trainerCClient.from('digital_content').select('id').eq('id', dcX?.id);
  console.log(`DC-R3: ${dcr3Err ? 'ERROR' : dcr3Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // DC-R4: Trainer A can read multiple content records belonging to Program X
  const { data: dcr4Data, error: dcr4Err } = await trainerAClient.from('digital_content').select('id').eq('program_id', program?.id);
  console.log(`DC-R4: ${dcr4Err ? 'ERROR' : dcr4Data && dcr4Data.length >= 2 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // DC-R5: Trainer A cannot bypass authorization by directly querying a content ID belonging to Program Y
  const { data: dcr5Data, error: dcr5Err } = await trainerAClient.from('digital_content').select('id').eq('id', dcY?.id);
  console.log(`DC-R5: ${dcr5Err ? 'ERROR' : dcr5Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // DC-R6: Trainer A cannot gain access to Program Y by supplying a different program ID from the client
  const { data: dcr6Data, error: dcr6Err } = await trainerAClient.from('digital_content').select('id').eq('program_id', programY?.id);
  console.log(`DC-R6: ${dcr6Err ? 'ERROR' : dcr6Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // DC-R7: Trainer A cannot INSERT digital content
  const { data: dcr7Data, error: dcr7Err } = await trainerAClient.from('digital_content').insert({ program_id: program?.id, title: 'Hack', file_url: 'http://hack.com' }).select('id');
  console.log(`DC-R7: ${dcr7Err && dcr7Err.code === '42501' ? 'DENIED_BY_RLS — PASS' : dcr7Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // DC-R8: Trainer A cannot UPDATE digital content
  const { data: dcr8Data, error: dcr8Err } = await trainerAClient.from('digital_content').update({ title: 'Hacked' }).eq('id', dcX?.id).select('id');
  console.log(`DC-R8: ${dcr8Err ? 'ERROR' : dcr8Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // Verify DC-R8 row unaffected
  const { data: verifyR8 } = await adminClient.from('digital_content').select('title').eq('id', dcX?.id).single();
  if (verifyR8?.title === 'Hacked') console.log('DC-R8-VERIFY: FAILED (Row was updated)');

  // DC-R9: Trainer A cannot DELETE digital content
  const { data: dcr9Data, error: dcr9Err } = await trainerAClient.from('digital_content').delete().eq('id', dcX?.id).select('id');
  console.log(`DC-R9: ${dcr9Err ? 'ERROR' : dcr9Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // Verify DC-R9 row unaffected
  const { data: verifyR9 } = await adminClient.from('digital_content').select('id').eq('id', dcX?.id).single();
  if (!verifyR9) console.log('DC-R9-VERIFY: FAILED (Row was deleted)');

  // DC-R10: Trainee A retains access to content for programs in which Trainee A is legitimately enrolled
  const { data: dcr10Data, error: dcr10Err } = await traineeAClient.from('digital_content').select('id').eq('id', dcX?.id);
  console.log(`DC-R10: ${dcr10Err ? 'ERROR' : dcr10Data && dcr10Data.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // DC-R11: Trainee A cannot access content for a program in which Trainee A is not enrolled
  const { data: dcr11Data, error: dcr11Err } = await traineeAClient.from('digital_content').select('id').eq('id', dcY?.id);
  console.log(`DC-R11: ${dcr11Err ? 'ERROR' : dcr11Data?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // DC-R12: Admin retains authorized access
  const { data: dcr12Data, error: dcr12Err } = await adminUserClient.from('digital_content').select('id').eq('id', dcY?.id);
  console.log(`DC-R12: ${dcr12Err ? 'ERROR' : dcr12Data && dcr12Data.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  console.log('\n[14] CROSS-TRAINER ISOLATION...');
  // Trainer A owns Session A -> Program X
  // Trainer B2 owns Session B2 -> Program Y (created above)
  
  // Trainer A -> Program X = AUTHORIZED
  const { data: cti1, error: ctiErr1 } = await trainerAClient.from('digital_content').select('id').eq('id', dcX?.id);
  console.log(`Trainer A -> Program X: ${ctiErr1 ? 'ERROR' : cti1 && cti1.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // Trainer A -> Program Y = DENIED_BY_RLS
  const { data: cti2, error: ctiErr2 } = await trainerAClient.from('digital_content').select('id').eq('id', dcY?.id);
  console.log(`Trainer A -> Program Y: ${ctiErr2 ? 'ERROR' : cti2?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // Trainer B (who owns Session B2 in Program Y) -> Program Y = AUTHORIZED
  const { data: cti3, error: ctiErr3 } = await trainerBClient.from('digital_content').select('id').eq('id', dcY?.id);
  console.log(`Trainer B -> Program Y: ${ctiErr3 ? 'ERROR' : cti3 && cti3.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // Trainer C -> Program X = DENIED_BY_RLS (Trainer C has no sessions)
  const { data: cti4, error: ctiErr4 } = await trainerCClient.from('digital_content').select('id').eq('id', dcX?.id);
  console.log(`Trainer C -> Program X: ${ctiErr4 ? 'ERROR' : cti4?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  console.log('\n[15] PHASE 14C: CERTIFICATES RLS VERIFICATION TESTS...');
  
  // Setup: Admin creates a certificate for Trainee A's enrollment
  const { data: certA, error: certErr } = await adminClient.from('certificates').insert({
    enrollment_id: enrA_id,
    type: 'completion',
  }).select('id').single();
  
  if (certErr) console.log('CERT SETUP ERROR:', certErr);

  // CE-1: Trainee A can read own certificate
  const { data: ce1, error: ce1Err } = await traineeAClient.from('certificates').select('id').eq('id', certA?.id);
  console.log(`CE-1 (Trainee Own Read): ${ce1Err ? 'ERROR' : ce1 && ce1.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // CE-2: Trainee B cannot read Trainee A's certificate
  const { data: ce2, error: ce2Err } = await traineeBClient.from('certificates').select('id').eq('id', certA?.id);
  console.log(`CE-2 (Trainee Cross-Read): ${ce2Err ? 'ERROR' : ce2?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // CE-3: Trainer A cannot read certificate
  const { data: ce3, error: ce3Err } = await trainerAClient.from('certificates').select('id').eq('id', certA?.id);
  console.log(`CE-3 (Trainer Read): ${ce3Err ? 'ERROR' : ce3?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // CE-4: Admin can read certificate
  const { data: ce4, error: ce4Err } = await adminUserClient.from('certificates').select('id').eq('id', certA?.id);
  console.log(`CE-4 (Admin Read): ${ce4Err ? 'ERROR' : ce4 && ce4.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // CE-5: Trainee cannot insert certificate
  const { data: ce5, error: ce5Err } = await traineeAClient.from('certificates').insert({ enrollment_id: enrA_id, type: 'participation' }).select('id');
  console.log(`CE-5 (Trainee Insert): ${ce5Err && ce5Err.code === '42501' ? 'DENIED_BY_RLS — PASS' : ce5?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // CE-6: Trainee cannot update certificate
  const { data: ce6, error: ce6Err } = await traineeAClient.from('certificates').update({ type: 'participation' }).eq('id', certA?.id).select('id');
  console.log(`CE-6 (Trainee Update): ${ce6Err ? 'ERROR' : ce6?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // CE-7: Trainee cannot delete certificate
  const { data: ce7, error: ce7Err } = await traineeAClient.from('certificates').delete().eq('id', certA?.id).select('id');
  console.log(`CE-7 (Trainee Delete): ${ce7Err ? 'ERROR' : ce7?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // CE-8: Admin can update certificate
  const { data: ce8, error: ce8Err } = await adminUserClient.from('certificates').update({ type: 'participation' }).eq('id', certA?.id).select('id');
  console.log(`CE-8 (Admin Update): ${ce8Err ? 'ERROR' : ce8 && ce8.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // CE-9: Admin can delete certificate
  const { data: ce9, error: ce9Err } = await adminUserClient.from('certificates').delete().eq('id', certA?.id).select('id');
  console.log(`CE-9 (Admin Delete): ${ce9Err ? 'ERROR' : ce9 && ce9.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  console.log('\n[16] PHASE 15: PROFILE MASS ASSIGNMENT & UPDATE TESTS...');

  // Setup: Admin sets initial party_affiliation
  await adminClient.from('profiles').update({ party_affiliation: 'Party A' }).eq('id', uidTraineeA);

  // TP-9: Trainee A can update allowed fields via direct API
  const { data: tp9, error: tp9Err } = await traineeAClient.from('profiles').update({ age: 25, experience: 'Test' }).eq('id', uidTraineeA).select('age, experience').single();
  console.log(`TP-9 (Trainee Own Update Allowed): ${tp9Err ? 'ERROR' : tp9?.age === 25 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // TP-10: Trainee A attempt to update party_affiliation is filtered by trigger
  const { data: tp10, error: tp10Err } = await traineeAClient.from('profiles').update({ party_affiliation: 'Hacked Party' }).eq('id', uidTraineeA).select('party_affiliation').single();
  console.log(`TP-10 (Trainee Update Affiliation): ${tp10Err ? 'ERROR' : tp10?.party_affiliation === 'Party A' ? 'FILTERED — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  // TP-11: Admin can update party_affiliation
  const { data: tp11, error: tp11Err } = await adminClient.from('profiles').update({ party_affiliation: 'Party B' }).eq('id', uidTraineeA).select('party_affiliation').single();
  console.log(`TP-11 (Admin Update Affiliation): ${tp11Err ? 'ERROR' : tp11?.party_affiliation === 'Party B' ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // TP-12: Trainee A attempt to update other trainee profile
  const { data: tp12, error: tp12Err } = await traineeAClient.from('profiles').update({ full_name: 'Hacked' }).eq('id', uidTraineeB).select('id');
  console.log(`TP-12 (Trainee Cross-Update): ${tp12Err ? 'ERROR' : tp12?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'UNEXPECTED_SUCCESS — FAIL'}`);

  console.log('\n[17] PHASE 17: ADMIN ROLE, LOCKOUT & AUDIT LOGS TESTS...');

  // TP-ADMIN-01 trainee self-promote → DENIED
  const { error: tpad1Err } = await traineeAClient.from('user_roles').insert({ user_id: uidTraineeA, role: 'admin' });
  console.log(`TP-ADMIN-01 (trainee self-promote): ${tpad1Err ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-ADMIN-02 trainer self-promote → DENIED
  const { error: tpad2Err } = await trainerAClient.from('user_roles').insert({ user_id: uidTrainerA, role: 'admin' });
  console.log(`TP-ADMIN-02 (trainer self-promote): ${tpad2Err ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-ADMIN-03 trainee promote another → DENIED
  const { error: tpad3Err } = await traineeAClient.from('user_roles').insert({ user_id: uidTraineeB, role: 'admin' });
  console.log(`TP-ADMIN-03 (trainee promote another): ${tpad3Err ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-ADMIN-04 trainer promote another → DENIED
  const { error: tpad4Err } = await trainerAClient.from('user_roles').insert({ user_id: uidTraineeA, role: 'admin' });
  console.log(`TP-ADMIN-04 (trainer promote another): ${tpad4Err ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-ADMIN-05 admin promote user → AUTHORIZED (We use trainee B for this, upgrade to admin first to test)
  const { data: tpad5, error: tpad5Err } = await adminUserClient.from('user_roles').update({ role: 'admin' }).eq('user_id', uidTraineeB).select('role').single();
  console.log(`TP-ADMIN-05 (admin promote user): ${tpad5Err ? 'FAIL' : tpad5?.role === 'admin' ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // TP-ADMIN-06 duplicate Admin promotion → controlled/idempotent
  const { error: tpad6Err } = await adminClient.from('user_roles').upsert({ user_id: uidTraineeB, role: 'admin' }, { onConflict: 'user_id' });
  console.log(`TP-ADMIN-06 (duplicate promotion): ${tpad6Err ? 'FAIL' : 'AUTHORIZED — PASS'}`);

  // TP-LOCK-03 Admin removing another Admin while another Admin exists → AUTHORIZED
  const { error: tplock3Err } = await adminUserClient.from('user_roles').delete().eq('user_id', uidTraineeB);
  console.log(`TP-LOCK-03 (remove another Admin): ${tplock3Err ? 'FAIL' : 'AUTHORIZED — PASS'}`);
  
  // Now ensure uidAdmin is the ONLY admin in the system so the trigger fires
  const { data: allAdmins } = await adminClient.from('user_roles').select('*').eq('role', 'admin');
  if (allAdmins) {
    for (const a of allAdmins) {
      if (a.user_id !== uidAdmin) {
        await adminClient.from('user_roles').delete().eq('user_id', a.user_id);
      }
    }
  }

  // TP-LOCK-01 final Admin self-delete → DENIED_BY_TRIGGER
  const { error: tplock1Err } = await adminUserClient.from('user_roles').delete().eq('user_id', uidAdmin);
  console.log(`TP-LOCK-01 (final Admin self-delete): ${tplock1Err && tplock1Err.code === 'P0001' ? 'DENIED_BY_TRIGGER — PASS' : 'FAIL'}`, tplock1Err);

  // TP-LOCK-02 final Admin demotion → DENIED_BY_TRIGGER
  const { error: tplock2Err } = await adminUserClient.from('user_roles').update({ role: 'trainee' }).eq('user_id', uidAdmin);
  console.log(`TP-LOCK-02 (final Admin demotion): ${tplock2Err && tplock2Err.code === 'P0001' ? 'DENIED_BY_TRIGGER — PASS' : 'FAIL'}`, tplock2Err);

  // Audit logs tests
  // TP-AUDIT-01 unauthorized trainee audit read → DENIED
  const { data: tpaud1, error: tpaud1Err } = await traineeAClient.from('audit_logs').select('id');
  console.log(`TP-AUDIT-01 (trainee audit read): ${tpaud1Err || tpaud1?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-AUDIT-02 unauthorized trainer audit read → DENIED
  const { data: tpaud2, error: tpaud2Err } = await trainerAClient.from('audit_logs').select('id');
  console.log(`TP-AUDIT-02 (trainer audit read): ${tpaud2Err || tpaud2?.length === 0 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-AUDIT-03 arbitrary trainee audit insert → DENIED
  const { error: tpaud3Err } = await traineeAClient.from('audit_logs').insert({ action: 'test', target_table: 'test' });
  console.log(`TP-AUDIT-03 (trainee audit insert): ${tpaud3Err ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-AUDIT-04 arbitrary trainer audit insert → DENIED
  const { error: tpaud4Err } = await trainerAClient.from('audit_logs').insert({ action: 'test', target_table: 'test' });
  console.log(`TP-AUDIT-04 (trainer audit insert): ${tpaud4Err ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  // TP-AUDIT-05 authorized role change produces audit event
  const { data: tpaud5 } = await adminClient.from('audit_logs').select('*').eq('action', 'role_changed').eq('target_id', uidTraineeB);
  console.log(`TP-AUDIT-05 (role change produces audit): ${tpaud5 && tpaud5.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  // TP-AUDIT-06 unauthorized role change produces no legitimate audit event
  const { data: tpaud6 } = await adminClient.from('audit_logs').select('*').eq('actor_id', uidTraineeA);
  console.log(`TP-AUDIT-06 (unauth role change = no audit): ${tpaud6 && tpaud6.length > 0 ? 'FAIL' : 'AUTHORIZED — PASS'}`);
  
  // TP-AUDIT-07 application approval audit event
  const { data: tpaud7 } = await adminClient.from('audit_logs').select('*').eq('action', 'application_status_changed');
  console.log(`TP-AUDIT-07 (app approval audit): ${tpaud7 && tpaud7.length > 0 ? 'AUTHORIZED — PASS' : 'FAIL'}`);

  console.log('\n[19] PHASE 19: ADMIN PROGRAMS & SESSIONS MANAGEMENT...');
  
  const { error: p19_prog1 } = await adminUserClient.from('programs').insert({ title: 'TP19 Program' });
  console.log(`TP19-PROGRAM (Admin create program): ${p19_prog1 ? 'FAIL' : 'AUTHORIZED — PASS'}`);
  
  const { error: p19_prog2 } = await traineeAClient.from('programs').insert({ title: 'TP19 Fake' });
  console.log(`TP19-PROGRAM (Trainee create program): ${p19_prog2 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  const { error: p19_prog3 } = await trainerAClient.from('programs').insert({ title: 'TP19 Fake' });
  console.log(`TP19-PROGRAM (Trainer create program): ${p19_prog3 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  const { data: tp19Program } = await adminClient.from('programs').select('id').eq('title', 'TP19 Program').single();
  
  const { error: p19_sess1 } = await adminUserClient.from('sessions').insert({ 
    program_id: tp19Program?.id, package_id: pkg?.id, session_date: new Date().toISOString(), trainer_id: uidTrainerA 
  });
  console.log(`TP19-SESSION (Admin create session): ${p19_sess1 ? 'FAIL' : 'AUTHORIZED — PASS'}`);
  
  const { error: p19_sess2 } = await traineeAClient.from('sessions').insert({ 
    program_id: tp19Program?.id, package_id: pkg?.id, session_date: new Date().toISOString()
  });
  console.log(`TP19-SESSION (Trainee create session): ${p19_sess2 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);
  
  const { data: tp19Session } = await adminClient.from('sessions').select('id, trainer_id').eq('program_id', tp19Program?.id).single();

  await trainerAClient.from('sessions').update({ trainer_id: uidTrainerB }).eq('id', tp19Session?.id);
  const { data: verifySession } = await adminClient.from('sessions').select('trainer_id').eq('id', tp19Session?.id).single();
  console.log(`TP19-TRAINER (Trainer reassign session): ${verifySession?.trainer_id === uidTrainerA ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  console.log('\n[20] PHASE 20: ADMIN DIGITAL CONTENT MANAGEMENT...');
  
  const { error: p20_c1 } = await adminUserClient.from('digital_content').insert({ 
    program_id: program?.id, title: 'Admin Content', file_url: 'https://example.com' 
  });
  console.log(`TP20-CONTENT (Admin create content): ${p20_c1 ? 'FAIL' : 'AUTHORIZED — PASS'}`);
  
  const { error: p20_c2 } = await trainerAClient.from('digital_content').insert({ 
    program_id: program?.id, title: 'Trainer Content', file_url: 'https://example.com' 
  });
  console.log(`TP20-CONTENT (Trainer create content): ${p20_c2 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  const { error: p20_c3 } = await traineeAClient.from('digital_content').insert({ 
    program_id: program?.id, title: 'Trainee Content', file_url: 'https://example.com' 
  });
  console.log(`TP20-CONTENT (Trainee create content): ${p20_c3 ? 'DENIED_BY_RLS — PASS' : 'FAIL'}`);

  const { data: tp20Content } = await adminClient.from('digital_content').select('id').eq('title', 'Admin Content').single();

  const { error: p20_c4 } = await adminUserClient.from('digital_content').delete().eq('id', tp20Content?.id);
  console.log(`TP20-CONTENT (Admin delete content): ${p20_c4 ? 'FAIL' : 'AUTHORIZED — PASS'}`);

  console.log('\n[21] CLEANUP...');
  await adminClient.from('programs').delete().in('id', [program?.id, programY?.id, tp19Program?.id]);
  await adminClient.from('training_packages').delete().eq('id', pkg?.id);
  await adminClient.auth.admin.deleteUser(uidTraineeA, false);
  await adminClient.auth.admin.deleteUser(uidTraineeB, false);
  await adminClient.auth.admin.deleteUser(uidTrainerA, false);
  await adminClient.auth.admin.deleteUser(uidTrainerB, false);
  await adminClient.auth.admin.deleteUser(uidTrainerC, false);
  await adminClient.auth.admin.deleteUser(uidAdmin, false);
  console.log('Cleanup complete.');
}

runTests().catch(console.error);
