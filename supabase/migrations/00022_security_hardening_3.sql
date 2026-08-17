-- Security hardening round 3: remaining MEDIUM/LOW audit findings.

-- =========================================================
-- MEDIUM: Students may only submit to assignments for courses
--         they are enrolled in (was any assignment).
-- =========================================================
DROP POLICY IF EXISTS "Students can insert submissions" ON submissions;
CREATE POLICY "Students can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM assignments a
      JOIN courses c ON c.code = a.course_code
      WHERE a.id = submissions.assignment_id
        AND EXISTS (
          SELECT 1 FROM accepted_courses ac
          WHERE ac.course_id = c.id AND ac.user_id = auth.uid()
        )
    )
  );

-- =========================================================
-- LOW: Admins can delete profiles (account cleanup).
-- =========================================================
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (get_my_role() = 'admin');

-- =========================================================
-- LOW: Lecturers/admins can delete assignments for courses
--      they own.
-- =========================================================
DROP POLICY IF EXISTS "Lecturers and admins can delete assignments" ON assignments;
CREATE POLICY "Lecturers and admins can delete assignments"
  ON assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.code = assignments.course_code
        AND (c.user_id = auth.uid() OR get_my_role() = 'admin')
    )
  );

-- =========================================================
-- LOW: Lecturers/admins can delete submissions for courses
--      they own. (Students are deliberately NOT given delete,
--      to prevent grade/submission tampering.)
-- =========================================================
DROP POLICY IF EXISTS "Lecturers and admins can delete submissions" ON submissions;
CREATE POLICY "Lecturers and admins can delete submissions"
  ON submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.code = submissions.course_code
        AND (c.user_id = auth.uid() OR get_my_role() = 'admin')
    )
  );

-- =========================================================
-- LOW: activity_log inserts must be attributed to the caller
--      (was: any authenticated user could log under any user_id).
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can log activity" ON activity_log;
CREATE POLICY "Authenticated users can log activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
