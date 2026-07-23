-- FIX: Drop the recursive admin policy that causes infinite recursion
-- The original "Users can read own profile" policy (auth.uid() = id) already lets everyone read their own profile
-- The admin policy queries profiles FROM profiles which causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
