-- 20260101000010_fix_profile_trigger.sql

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
