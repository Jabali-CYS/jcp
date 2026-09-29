-- Migration: Phase 13B - Attendance Security Fix
-- Purpose: Fix IDOR in attendance where trainer could submit arbitrary enrollment_ids.

-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "attendance_select" ON attendance;
DROP POLICY IF EXISTS "attendance_write" ON attendance;

-- 2. Admin access (Full access)
CREATE POLICY "attendance_admin_all" ON attendance FOR ALL USING (is_admin());

-- 3. Trainee access (Read-only for own enrollment)
CREATE POLICY "attendance_trainee_select" ON attendance FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments 
        WHERE enrollments.id = attendance.enrollment_id 
        AND enrollments.profile_id = auth.uid()
    )
);

-- 4. Trainer access (Select for enrollments in own sessions)
CREATE POLICY "attendance_trainer_select" ON attendance FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = attendance.enrollment_id
        AND sessions.trainer_id = auth.uid()
        AND attendance.session_id = sessions.id
    )
);

-- 5. Trainer access (Insert for enrollments in own sessions with integrity check)
CREATE POLICY "attendance_trainer_insert" ON attendance FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = attendance.enrollment_id
        AND sessions.trainer_id = auth.uid()
        AND attendance.session_id = sessions.id
    )
);

-- 6. Trainer access (Update for enrollments in own sessions with integrity check)
CREATE POLICY "attendance_trainer_update" ON attendance FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = attendance.enrollment_id
        AND sessions.trainer_id = auth.uid()
        AND attendance.session_id = sessions.id
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM enrollments
        JOIN sessions ON sessions.id = enrollments.session_id
        WHERE enrollments.id = attendance.enrollment_id
        AND sessions.trainer_id = auth.uid()
        AND attendance.session_id = sessions.id
    )
);
