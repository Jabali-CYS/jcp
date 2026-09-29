-- ==============================================================================
-- PHASE 10: TRAINER PROFILE ACCESS VIEW
-- ==============================================================================

-- Create a secure view that strictly projects id and full_name.
-- By default in PostgreSQL, views execute with the privileges of the view owner (postgres),
-- effectively bypassing the underlying RLS on `profiles`.
-- To ensure authorization, we hardcode the `auth.uid()` predicate directly into the view definition.
-- This guarantees that a trainer can only see the profiles of trainees enrolled in their sessions,
-- without exposing sensitive columns like `party_affiliation` or `age`.

CREATE OR REPLACE VIEW trainer_trainee_names AS
SELECT DISTINCT p.id, p.full_name
FROM profiles p
JOIN enrollments e ON p.id = e.profile_id
JOIN sessions s ON e.session_id = s.id
WHERE s.trainer_id = auth.uid();

-- Grant explicit access to authenticated users to query the view via PostgREST.
-- The hardcoded `auth.uid()` ensures trainees get 0 rows and trainers get isolated access.
GRANT SELECT ON trainer_trainee_names TO authenticated;
GRANT SELECT ON trainer_trainee_names TO service_role;
