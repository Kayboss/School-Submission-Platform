-- Allow admins to update any user's profile (e.g., change roles).
-- Uses get_my_role() (SECURITY DEFINER) to avoid the recursive-policy issue.

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (get_my_role() = 'admin');
