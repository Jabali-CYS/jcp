-- Migration: Phase 13A - Evaluations Security Fix
-- Purpose: Shift evaluation creation from Trainee to Trainer and restrict access to authorized sessions only.

-- 1. Drop existing permissive and trainee-centric policies
DROP POLICY IF EXISTS "evaluations_select" ON evaluations;
DROP POLICY IF EXISTS "evaluations_insert" ON evaluations;
DROP POLICY IF EXISTS "evaluations_admin_all" ON evaluations;
DROP POLICY IF EXISTS "evaluations_admin_del" ON evaluations;

-- 2. Admin access (Full access)
CREATE POLICY "evaluations_admin_all" ON evaluations FOR ALL USING (is_admin());

-- 3. Trainee access (Read-only for own enrollment)
CREATE POLICY "evaluations_trainee_select" ON evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments 
        WHERE enrollments.id = evaluations.enrollment_id 
        AND enrollments.profile_id = auth.uid()
    )
);

-- 4. Trainer access (Select for enrollments in own sessions)
CREATE POLICY "evaluations_trainer_select" ON evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = evaluations.enrollment_id
        AND sessions.trainer_id = auth.uid()
    )
);

-- 5. Trainer access (Insert for enrollments in own sessions)
CREATE POLICY "evaluations_trainer_insert" ON evaluations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = evaluations.enrollment_id
        AND sessions.trainer_id = auth.uid()
    )
);

-- 6. Trainer access (Update for enrollments in own sessions)
CREATE POLICY "evaluations_trainer_update" ON evaluations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = evaluations.enrollment_id
        AND sessions.trainer_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = evaluations.enrollment_id
        AND sessions.trainer_id = auth.uid()
    )
);
