-- Fix for user_roles: Ensure WITH CHECK is explicitly defined for admin operations
DROP POLICY IF EXISTS "user_roles_admin_all" ON user_roles;
CREATE POLICY "user_roles_admin_all" ON user_roles 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Fix for profiles: Ensure WITH CHECK is explicitly defined for updates to enforce ownership
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles 
FOR UPDATE USING (auth.uid() = id OR is_admin()) WITH CHECK (auth.uid() = id OR is_admin());
