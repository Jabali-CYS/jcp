-- 20260101000008_evaluations_trainee_select.sql

-- Allow trainees to read their own evaluations
DROP POLICY IF EXISTS "evaluations_trainee_select" ON evaluations;
CREATE POLICY "evaluations_trainee_select" ON evaluations 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM enrollments 
        WHERE enrollments.id = evaluations.enrollment_id 
        AND enrollments.profile_id = auth.uid()
    )
);
