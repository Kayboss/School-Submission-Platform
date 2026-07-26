-- Allow admin to insert/update/delete assignments (not just lecturers)

DROP POLICY IF EXISTS "Lecturers can insert assignments" ON assignments;
CREATE POLICY "Lecturers and admins can insert assignments"
  ON assignments FOR INSERT
  WITH CHECK (
    get_my_role() IN ('lecturer', 'admin')
  );

DROP POLICY IF EXISTS "Lecturers can update assignments" ON assignments;
CREATE POLICY "Lecturers and admins can update assignments"
  ON assignments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR get_my_role() = 'admin'
  );
