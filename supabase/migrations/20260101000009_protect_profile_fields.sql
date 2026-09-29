-- 20260101000009_protect_profile_fields.sql

-- Protect admin-controlled fields in profiles table from being modified by non-admins
CREATE OR REPLACE FUNCTION protect_profile_fields() RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role bypass or admin users
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role' OR is_admin() THEN
    RETURN NEW;
  END IF;
  
  -- Ensure these fields cannot be changed by the user directly
  NEW.party_affiliation := OLD.party_affiliation;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_fields ON profiles;
CREATE TRIGGER tr_protect_profile_fields
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_profile_fields();
