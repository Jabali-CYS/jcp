-- ==============================================================================
-- JCP ACADEMY - INITIAL SCHEMA MIGRATION
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- Profiles: Binds to auth.users and holds application identity.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER,
    party_affiliation TEXT,
    experience TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Roles: RBAC implementation (admin, trainer, trainee). Managed server-side.
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('trainee', 'trainer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs: Core training programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training Packages: Modules within programs
CREATE TABLE training_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions (Training Activities): Instances of packages within programs, led by trainers
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES training_packages(id) ON DELETE RESTRICT,
    trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications: User requests to join a program
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    commitment_agreed BOOLEAN NOT NULL DEFAULT FALSE,
    local_leadership_approval BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, program_id)
);

-- Enrollments: Approved participations
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, session_id)
);

-- Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(enrollment_id, session_id)
);

-- Evaluations
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('pre', 'post')),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digital Content
CREATE TABLE digital_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('completion', 'participation')),
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, program_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- RLS (ROW LEVEL SECURITY)
-- ==============================================================================
-- Note: 'service_role' key bypasses RLS completely.

-- Helper functions for role checks
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_trainer() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'trainer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------- PROFILES -----------------
-- Read: Own profile or admin
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
-- Update: Own profile or admin
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
-- Insert: Auth creates own profile
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ----------------- USER ROLES -----------------
-- Read: Own role or admin
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (auth.uid() = user_id OR is_admin());
-- Insert/Update/Delete: Admins ONLY (or service_role bypass)
CREATE POLICY "user_roles_admin_all" ON user_roles FOR ALL USING (is_admin());

-- ----------------- PROGRAMS & PACKAGES -----------------
-- Read: Publicly readable if active
CREATE POLICY "programs_select" ON programs FOR SELECT USING (status = 'active' OR is_admin());
CREATE POLICY "programs_admin_all" ON programs FOR ALL USING (is_admin());

CREATE POLICY "training_packages_select" ON training_packages FOR SELECT USING (true);
CREATE POLICY "training_packages_admin_all" ON training_packages FOR ALL USING (is_admin());

-- ----------------- SESSIONS -----------------
-- Read: Authenticated users can see sessions
CREATE POLICY "sessions_select" ON sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sessions_admin_all" ON sessions FOR ALL USING (is_admin());

-- ----------------- APPLICATIONS -----------------
-- Read: Own applications or admin
CREATE POLICY "applications_select" ON applications FOR SELECT USING (auth.uid() = profile_id OR is_admin());
-- Insert: Own applications, must be pending and unapproved
CREATE POLICY "applications_insert" ON applications FOR INSERT WITH CHECK (
    auth.uid() = profile_id 
    AND status = 'pending' 
    AND local_leadership_approval = FALSE
);
-- Update/Delete: Admins ONLY
CREATE POLICY "applications_admin_all" ON applications FOR UPDATE USING (is_admin());
CREATE POLICY "applications_admin_del" ON applications FOR DELETE USING (is_admin());

-- ----------------- ENROLLMENTS -----------------
-- Read: Own enrollments, admin, or trainer of the session
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT USING (
    auth.uid() = profile_id OR is_admin() OR 
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_id AND sessions.trainer_id = auth.uid())
);
-- Write: Admins ONLY
CREATE POLICY "enrollments_admin_all" ON enrollments FOR ALL USING (is_admin());

-- ----------------- ATTENDANCE -----------------
-- Read: Own attendance, admin, or trainer of the session
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.id = enrollment_id AND enrollments.profile_id = auth.uid()) OR
    is_admin() OR
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_id AND sessions.trainer_id = auth.uid())
);
-- Write: Admin or Trainer of the session
CREATE POLICY "attendance_write" ON attendance FOR ALL USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_id AND sessions.trainer_id = auth.uid())
);

-- ----------------- EVALUATIONS -----------------
-- Read: Admin or Trainer
CREATE POLICY "evaluations_select" ON evaluations FOR SELECT USING (is_admin() OR is_trainer());
-- Insert: Enrolled trainees
CREATE POLICY "evaluations_insert" ON evaluations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.id = enrollment_id AND enrollments.profile_id = auth.uid())
);
CREATE POLICY "evaluations_admin_all" ON evaluations FOR UPDATE USING (is_admin());
CREATE POLICY "evaluations_admin_del" ON evaluations FOR DELETE USING (is_admin());

-- ----------------- DIGITAL CONTENT -----------------
-- Read: Enrolled trainees or Admin
CREATE POLICY "content_select" ON digital_content FOR SELECT USING (
    is_admin() OR
    EXISTS (
        SELECT 1 FROM enrollments e
        JOIN sessions s ON e.session_id = s.id
        WHERE s.program_id = digital_content.program_id AND e.profile_id = auth.uid()
    )
);
-- Write: Admin ONLY
CREATE POLICY "content_admin_all" ON digital_content FOR ALL USING (is_admin());

-- ----------------- CERTIFICATES -----------------
-- Read: Own certificates or Admin
CREATE POLICY "certificates_select" ON certificates FOR SELECT USING (auth.uid() = profile_id OR is_admin());
-- Write: Admin ONLY
CREATE POLICY "certificates_admin_all" ON certificates FOR ALL USING (is_admin());

-- ----------------- AUDIT LOGS -----------------
-- Read: Admin ONLY
CREATE POLICY "audit_select" ON audit_logs FOR SELECT USING (is_admin());
-- Write: Service Role ONLY (RLS bypass). Ordinary users cannot write directly.
