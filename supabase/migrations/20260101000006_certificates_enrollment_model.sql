-- 20260101000006_certificates_enrollment_model.sql

-- Drop existing policies that depend on profile_id
DROP POLICY IF EXISTS "certificates_select" ON certificates;
DROP POLICY IF EXISTS "certificates_admin_all" ON certificates;

-- Clear any existing unused data to allow safe schema change
TRUNCATE TABLE certificates CASCADE;

-- Remove the old unique constraint
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_profile_id_program_id_key;

-- Drop redundant columns
ALTER TABLE certificates DROP COLUMN IF EXISTS profile_id;
ALTER TABLE certificates DROP COLUMN IF EXISTS program_id;

-- Add enrollment_id
ALTER TABLE certificates ADD COLUMN enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE;

-- Enforce exactly one certificate per enrollment
ALTER TABLE certificates ADD CONSTRAINT certificates_enrollment_id_key UNIQUE (enrollment_id);

-- Recreate RLS
CREATE POLICY "certificates_select" 
ON certificates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.id = certificates.enrollment_id 
      AND enrollments.profile_id = auth.uid()
  ) 
  OR is_admin()
);

CREATE POLICY "certificates_admin_all" 
ON certificates 
FOR ALL 
USING (is_admin());
