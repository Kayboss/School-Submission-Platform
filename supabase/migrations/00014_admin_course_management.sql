-- Allow admin to insert/update/delete courses (not just lecturers)

DROP POLICY IF EXISTS "Lecturers can insert courses" ON courses;
CREATE POLICY "Lecturers and admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    get_my_role() IN ('lecturer', 'admin')
  );

DROP POLICY IF EXISTS "Lecturers update own courses" ON courses;
CREATE POLICY "Lecturers and admins can update courses"
  ON courses FOR UPDATE
  USING (
    auth.uid() = user_id
    OR get_my_role() = 'admin'
  );

DROP POLICY IF EXISTS "Lecturers delete own courses" ON courses;
CREATE POLICY "Lecturers and admins can delete courses"
  ON courses FOR DELETE
  USING (
    auth.uid() = user_id
    OR get_my_role() = 'admin'
  );
