const fs = require('fs');
const path = require('path');

const backupFiles = fs.readdirSync(path.join(process.cwd(), 'supabase')).filter(f => f.startsWith('supabase_backup_'));
const latest = backupFiles.sort().reverse()[0];
console.log('Reading snapshot:', latest);

const db = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'supabase', latest), 'utf8'));

console.log('\n================ ALL 11 PROGRAMS & THEIR DEPENDENCIES ================');
db.programs.forEach(prog => {
  const sessions = db.sessions.filter(s => s.program_id === prog.id);
  const sessionIds = sessions.map(s => s.id);
  const apps = db.applications.filter(a => a.program_id === prog.id);
  const content = db.digital_content.filter(dc => dc.program_id === prog.id);
  const enrolls = db.enrollments.filter(e => sessionIds.includes(e.session_id));
  const enrollIds = enrolls.map(e => e.id);
  const certs = db.certificates.filter(c => enrollIds.includes(c.enrollment_id));
  
  const isTest = prog.title.includes('Admin') || prog.title.includes('Program Y') || prog.title.includes('Phase 10') || prog.title.includes('E2E');
  console.log(`[${isTest ? 'TEST' : 'REAL'}] "${prog.title}" (${prog.id})`);
  console.log(`  - Sessions: ${sessions.length}`);
  console.log(`  - Digital Content: ${content.length}`);
  console.log(`  - Applications: ${apps.length} ${apps.length > 0 ? '(Profile: ' + apps[0].profile_id + ')' : ''}`);
  console.log(`  - Enrollments: ${enrolls.length} ${enrolls.length > 0 ? '(ID: ' + enrolls[0].id + ')' : ''}`);
  console.log(`  - Certificates: ${certs.length} ${certs.length > 0 ? '(Serial: ' + certs[0].serial_number + ')' : ''}`);
});

console.log('\n================ ALL 9 TRAINING PACKAGES ================');
db.training_packages.forEach(pkg => {
  const sessions = db.sessions.filter(s => s.package_id === pkg.id);
  const isTest = pkg.title.includes('Admin') || pkg.title.includes('Phase 10') || pkg.title.includes('E2E');
  console.log(`[${isTest ? 'TEST' : 'REAL'}] "${pkg.title}" (${pkg.id})`);
  console.log(`  - Sessions referencing: ${sessions.length}`);
});

console.log('\n================ ALL 10 DIGITAL CONTENT ================');
db.digital_content.forEach(dc => {
  const prog = db.programs.find(p => p.id === dc.program_id);
  console.log(` - "${dc.title}" -> Program: "${prog ? prog.title : 'UNKNOWN'}" (${dc.program_id})`);
});
