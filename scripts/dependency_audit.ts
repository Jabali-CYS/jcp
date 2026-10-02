import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function runDependencyAudit() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('================================================================');
  console.log('=== FOREIGN KEY & DEPENDENCY IMPACT AUDIT (READ-ONLY) ===');
  console.log('================================================================\n');

  // Load all data
  const { data: programs } = await client.from('programs').select('*');
  const { data: packages } = await client.from('training_packages').select('*');
  const { data: sessions } = await client.from('sessions').select('*');
  const { data: applications } = await client.from('applications').select('*');
  const { data: enrollments } = await client.from('enrollments').select('*');
  const { data: certificates } = await client.from('certificates').select('*');
  const { data: digitalContent } = await client.from('digital_content').select('*');
  const { data: profiles } = await client.from('profiles').select('*');
  const { data: userRoles } = await client.from('user_roles').select('*');
  const { data: auditLogs } = await client.from('audit_logs').select('*');

  // 1. DIGITAL CONTENT AUDIT
  console.log('--- 1. DIGITAL CONTENT DEPENDENCY AUDIT ---');
  console.log(`Total digital_content rows: ${digitalContent?.length || 0}`);
  digitalContent?.forEach(dc => {
    const parentProg = programs?.find(p => p.id === dc.program_id);
    console.log(` - Content ID: ${dc.id} | Title: "${dc.title}" | ProgramID: ${dc.program_id} ("${parentProg?.title || 'ORPHAN/UNKNOWN'}")`);
  });

  // 2. PROGRAMS AUDIT & CASCADE IMPACT
  console.log('\n--- 2. PROGRAMS DETAILED IMPACT MATRIX ---');
  for (const prog of programs || []) {
    const childSessions = sessions?.filter(s => s.program_id === prog.id) || [];
    const childContent = digitalContent?.filter(dc => dc.program_id === prog.id) || [];
    const childApps = applications?.filter(a => a.program_id === prog.id) || [];
    
    // Check enrollments connected through child sessions
    const childSessionIds = childSessions.map(s => s.id);
    const childEnrolls = enrollments?.filter(e => childSessionIds.includes(e.session_id)) || [];
    const childEnrollIds = childEnrolls.map(e => e.id);
    const childCerts = certificates?.filter(c => childEnrollIds.includes(c.enrollment_id)) || [];
    const childAudit = auditLogs?.filter(l => l.target_entity === prog.id || (typeof l.metadata === 'object' && JSON.stringify(l.metadata).includes(prog.id))) || [];

    const isTest = prog.title.includes('Admin') || prog.title.includes('Program Y') || prog.title.includes('Phase 10') || prog.title.includes('E2E');
    
    console.log(`\nProgram: "${prog.title}" [${prog.id}]`);
    console.log(`  Classification: ${isTest ? 'TEST/DUMMY' : 'REAL/CORE PRODUCTION'}`);
    console.log(`  Status: ${prog.status}`);
    console.log(`  Direct Dependencies:`);
    console.log(`    - Sessions count: ${childSessions.length} (IDs: ${childSessions.map(s => s.id).join(', ') || 'none'})`);
    console.log(`    - Digital Content count: ${childContent.length} (IDs: ${childContent.map(c => c.id).join(', ') || 'none'})`);
    console.log(`    - Applications count: ${childApps.length} (IDs: ${childApps.map(a => a.id).join(', ') || 'none'})`);
    console.log(`  Downstream Transitive Dependencies:`);
    console.log(`    - Enrollments connected: ${childEnrolls.length} (IDs: ${childEnrolls.map(e => e.id).join(', ') || 'none'})`);
    console.log(`    - Certificates connected: ${childCerts.length} (IDs: ${childCerts.map(c => c.id).join(', ') || 'none'})`);
    console.log(`    - Audit Logs pointing: ${childAudit.length}`);
    console.log(`  CASCADE Safety Verdict: ${childApps.length === 0 && childEnrolls.length === 0 && childCerts.length === 0 ? 'SAFE TO REMOVE (Zero real-user impact)' : 'BLOCKED - Contains Active Applications/Enrollments/Certs'}`);
  }

  // 3. TRAINING PACKAGES AUDIT & RESTRICT IMPACT
  console.log('\n--- 3. TRAINING PACKAGES AUDIT ---');
  for (const pkg of packages || []) {
    const childSessions = sessions?.filter(s => s.package_id === pkg.id) || [];
    const isTest = pkg.title.includes('Admin') || pkg.title.includes('Phase 10') || pkg.title.includes('E2E');

    console.log(`\nPackage: "${pkg.title}" [${pkg.id}]`);
    console.log(`  Classification: ${isTest ? 'TEST/DUMMY' : 'REAL/CORE PRODUCTION'}`);
    console.log(`  Sessions referencing (FK constraint: ON DELETE RESTRICT): ${childSessions.length}`);
    childSessions.forEach(s => {
      const parentProg = programs?.find(p => p.id === s.program_id);
      console.log(`    -> Session [${s.id}] under Program "${parentProg?.title}"`);
    });
  }

  // 4. THE 9 ORPHAN PROFILES AUDIT
  console.log('\n--- 4. THE 9 ORPHAN PROFILES COMPREHENSIVE DEPENDENCY AUDIT ---');
  const orphanProfiles = profiles?.filter(p => !userRoles?.some(r => r.user_id === p.id)) || [];
  console.log(`Found ${orphanProfiles.length} profiles with NO user_role assignment.\n`);

  for (const prof of orphanProfiles) {
    const profRole = userRoles?.filter(r => r.user_id === prof.id) || [];
    const profApps = applications?.filter(a => a.profile_id === prof.id) || [];
    const profEnrolls = enrollments?.filter(e => e.profile_id === prof.id) || [];
    const profTrainerSessions = sessions?.filter(s => s.trainer_id === prof.id) || [];
    const profLogsAsUser = auditLogs?.filter(l => l.user_id === prof.id) || [];
    const profLogsInMeta = auditLogs?.filter(l => typeof l.metadata === 'object' && JSON.stringify(l.metadata).includes(prof.id)) || [];

    console.log(`Profile: "${prof.full_name}" [${prof.id}] Created: ${prof.created_at}`);
    console.log(`  - user_roles: ${profRole.length}`);
    console.log(`  - applications: ${profApps.length}`);
    console.log(`  - enrollments: ${profEnrolls.length}`);
    console.log(`  - trainer in sessions: ${profTrainerSessions.length}`);
    console.log(`  - audit_logs (as actor user_id): ${profLogsAsUser.length}`);
    console.log(`  - audit_logs (in metadata target): ${profLogsInMeta.length}`);
    
    const isClean = profRole.length === 0 && profApps.length === 0 && profEnrolls.length === 0 && profTrainerSessions.length === 0;
    console.log(`  - Assessment: ${isClean ? '100% UNATTACHED (Dead record with no business relationships)' : 'ATTACHED - DO NOT DELETE'}`);
  }

  // 5. ACTIVE VERIFIED USERS CHECK (SMOKE TEST DATA)
  console.log('\n--- 5. ACTIVE VERIFIED USERS & SMOKE TEST DATA ---');
  const activeProfiles = profiles?.filter(p => userRoles?.some(r => r.user_id === p.id)) || [];
  for (const prof of activeProfiles) {
    const role = userRoles?.find(r => r.user_id === prof.id)?.role;
    const profApps = applications?.filter(a => a.profile_id === prof.id) || [];
    const profEnrolls = enrollments?.filter(e => e.profile_id === prof.id) || [];
    const enrollIds = profEnrolls.map(e => e.id);
    const profCerts = certificates?.filter(c => enrollIds.includes(c.enrollment_id)) || [];

    console.log(`User: "${prof.full_name}" [${prof.id}] | Role: ${role}`);
    console.log(`  - Applications: ${profApps.length} (Status: ${profApps.map(a => a.status).join(', ')})`);
    console.log(`  - Enrollments: ${profEnrolls.length} (Status: ${profEnrolls.map(e => e.status).join(', ')})`);
    console.log(`  - Certificates: ${profCerts.length} (Serials: ${profCerts.map(c => c.serial_number).join(', ')})`);
  }
}

runDependencyAudit();
