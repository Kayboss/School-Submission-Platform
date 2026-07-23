-- Create a security definer function to get current user's role
-- This avoids infinite recursion because SECURITY DEFINER bypasses RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix all admin read policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (get_my_role() = 'admin');

-- user_sessions: admin reads all, users read/insert/update own
DROP POLICY IF EXISTS "Admins can read all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
CREATE POLICY "Admins can read all sessions"
  ON user_sessions FOR SELECT
  USING (get_my_role() = 'admin');
CREATE POLICY "Users can read own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- activity_log: admin reads all, any authenticated user can insert
DROP POLICY IF EXISTS "Admins can read activity logs" ON activity_log;
DROP POLICY IF EXISTS "Authenticated users can log activity" ON activity_log;
CREATE POLICY "Admins can read activity logs"
  ON activity_log FOR SELECT
  USING (get_my_role() = 'admin');
CREATE POLICY "Authenticated users can log activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- research_responses: fix admin read policy
DROP POLICY IF EXISTS "Admins can read all responses" ON research_responses;
CREATE POLICY "Admins can read all responses"
  ON research_responses FOR SELECT
  USING (get_my_role() = 'admin');
