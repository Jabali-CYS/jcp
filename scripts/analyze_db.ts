import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function analyzeAll() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('=============================================');
  console.log('=== DATABASE INVENTORY & HYGIENE ANALYSIS ===');
  console.log('=============================================\n');

  // 1. PROGRAMS
  const { data: progs } = await client.from('programs').select('*').order('created_at', { ascending: true });
  console.log(`[TABLE: programs] Total: ${progs?.length}`);
  progs?.forEach(p => {
    const isTest = p.title.includes('Admin') || p.title.includes('Program Y') || p.title.includes('Phase 10') || p.title.includes('E2E');
    console.log(`  - [${isTest ? 'TEST/DUMMY' : 'KEEP (REAL)'}] ID: ${p.id} | Title: "${p.title}" | Status: ${p.status} | Created: ${p.created_at}`);
  });

  // 2. TRAINING PACKAGES
  const { data: pkgs } = await client.from('training_packages').select('*').order('created_at', { ascending: true });
  console.log(`\n[TABLE: training_packages] Total: ${pkgs?.length}`);
  pkgs?.forEach(pkg => {
    const isTest = pkg.title.includes('Admin') || pkg.title.includes('Phase 10') || pkg.title.includes('E2E');
    console.log(`  - [${isTest ? 'TEST/DUMMY' : 'KEEP (REAL)'}] ID: ${pkg.id} | Title: "${pkg.title}" | Created: ${pkg.created_at}`);
  });

  // 3. SESSIONS
  const { data: sessions } = await client.from('sessions').select('id, program_id, package_id, session_date, programs(title), training_packages(title)').order('created_at', { ascending: true });
  console.log(`\n[TABLE: sessions] Total: ${sessions?.length}`);
  sessions?.forEach(s => {
    // @ts-ignore
    const progTitle = s.programs?.title || 'Unknown';
    // @ts-ignore
    const pkgTitle = s.training_packages?.title || 'Unknown';
    const isTest = progTitle.includes('Admin') || progTitle.includes('Program Y') || progTitle.includes('Phase 10') || progTitle.includes('E2E');
    console.log(`  - [${isTest ? 'TEST/DUMMY' : 'KEEP (REAL)'}] ID: ${s.id} | Prog: "${progTitle}" | Pkg: "${pkgTitle}" | Date: ${s.session_date}`);
  });

  // 4. APPLICATIONS
  const { data: apps } = await client.from('applications').select('*, profiles(full_name), programs(title)');
  console.log(`\n[TABLE: applications] Total: ${apps?.length}`);
  apps?.forEach(a => {
    // @ts-ignore
    console.log(`  - ID: ${a.id} | User: ${a.profiles?.full_name} (${a.profile_id}) | Program: ${a.programs?.title} | Status: ${a.status}`);
  });

  // 5. ENROLLMENTS
  const { data: enrolls } = await client.from('enrollments').select('*, profiles(full_name), sessions(programs(title))');
  console.log(`\n[TABLE: enrollments] Total: ${enrolls?.length}`);
  enrolls?.forEach(e => {
    // @ts-ignore
    console.log(`  - ID: ${e.id} | User: ${e.profiles?.full_name} (${e.profile_id}) | Program: ${e.sessions?.programs?.title} | Status: ${e.status}`);
  });

  // 6. CERTIFICATES
  const { data: certs } = await client.from('certificates').select('*');
  console.log(`\n[TABLE: certificates] Total: ${certs?.length}`);
  certs?.forEach(c => {
    console.log(`  - ID: ${c.id} | Serial: ${c.serial_number} | Type: ${c.type} | EnrollmentID: ${c.enrollment_id}`);
  });

  // 7. PROFILES & ROLES
  const { data: profs } = await client.from('profiles').select('*, user_roles(role)').order('created_at', { ascending: true });
  console.log(`\n[TABLE: profiles & user_roles] Total profiles: ${profs?.length}`);
  profs?.forEach(p => {
    // @ts-ignore
    const role = p.user_roles?.role || 'NONE';
    const isOrphanOrTest = role === 'NONE' || p.full_name === 'Admin User' && role !== 'admin';
    console.log(`  - [${role === 'NONE' ? 'ORPHAN/TEST' : 'ACTIVE USER'}] ID: ${p.id} | Name: "${p.full_name}" | Role: ${role} | Created: ${p.created_at}`);
  });

  // 8. AUDIT LOGS
  const { count: auditCount } = await client.from('audit_logs').select('*', { count: 'exact', head: true });
  console.log(`\n[TABLE: audit_logs] Total records: ${auditCount}`);
}

analyzeAll();
