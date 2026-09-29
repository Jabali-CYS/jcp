-- 20260101000011_admin_security_foundation.sql

-- 1. Add JSONB details to audit_logs for meaningful change tracking
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB;

-- 2. Anti-Lockout Protection on user_roles
CREATE OR REPLACE FUNCTION tr_prevent_last_admin_deletion()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INT;
BEGIN
  -- We only care if an admin role is being removed or changed to non-admin
  IF OLD.role = 'admin' AND (TG_OP = 'DELETE' OR NEW.role != 'admin') THEN
    SELECT count(*) INTO admin_count FROM user_roles WHERE role = 'admin' AND user_id != OLD.user_id;
    IF admin_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last administrator.';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_last_admin_deletion ON user_roles;
CREATE TRIGGER prevent_last_admin_deletion
  BEFORE UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION tr_prevent_last_admin_deletion();

-- 3. Audit Logging Trigger for user_roles
CREATE OR REPLACE FUNCTION tr_audit_role_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
BEGIN
  v_actor_id := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (actor_id, action, target_table, target_id, details)
    VALUES (v_actor_id, 'role_assigned', 'user_roles', NEW.user_id, jsonb_build_object('new_role', NEW.role));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role != NEW.role THEN
      INSERT INTO audit_logs (actor_id, action, target_table, target_id, details)
      VALUES (v_actor_id, 'role_changed', 'user_roles', NEW.user_id, jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (actor_id, action, target_table, target_id, details)
    VALUES (v_actor_id, 'role_removed', 'user_roles', OLD.user_id, jsonb_build_object('old_role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_role_changes ON user_roles;
CREATE TRIGGER audit_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION tr_audit_role_changes();

-- 4. Audit Logging Trigger for applications
CREATE OR REPLACE FUNCTION tr_audit_applications()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
BEGIN
  v_actor_id := auth.uid();
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (actor_id, action, target_table, target_id, details)
    VALUES (v_actor_id, 'application_status_changed', 'applications', NEW.id, jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_applications ON applications;
CREATE TRIGGER audit_applications
  AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION tr_audit_applications();
