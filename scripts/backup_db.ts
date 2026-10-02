import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
});

async function backupDatabase() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const tables = [
    'profiles',
    'user_roles',
    'programs',
    'training_packages',
    'sessions',
    'applications',
    'enrollments',
    'attendance',
    'evaluations',
    'digital_content',
    'certificates',
    'audit_logs'
  ];

  const snapshot: Record<string, any[]> = {};
  const stats: Record<string, number> = {};

  console.log('--- STARTING COMPLETE DATABASE BACKUP ---');

  for (const table of tables) {
    const { data, error } = await client.from(table).select('*');
    if (error) {
      console.error(`Error backing up table ${table}:`, error);
      snapshot[table] = [];
      stats[table] = -1;
    } else {
      snapshot[table] = data || [];
      stats[table] = data ? data.length : 0;
      console.log(`✓ Table [${table}]: Exported ${stats[table]} records`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `supabase_backup_${timestamp}.json`;
  const backupPath = path.join(process.cwd(), 'supabase', backupFileName);

  // Ensure directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'supabase'))) {
    fs.mkdirSync(path.join(process.cwd(), 'supabase'), { recursive: true });
  }

  fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`\nSUCCESS: Database snapshot written to ${backupPath}`);
  console.log('SUMMARY OF BACKED UP RECORDS:', stats);
}

backupDatabase();
