-- Add user_id to courses for lecturer ownership
ALTER TABLE courses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add user_id to assignments for lecturer ownership
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Update RLS: Lecturers can only read their own courses (plus students read all for enrollment)
DROP POLICY IF EXISTS "Anyone can read courses" ON courses;
CREATE POLICY "Lecturers read own courses"
  ON courses FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Lecturers can update courses" ON courses;
CREATE POLICY "Lecturers update own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lecturers can delete courses" ON courses;
CREATE POLICY "Lecturers delete own courses"
  ON courses FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS: Assignments - students read all, lecturers read own, admins read all
DROP POLICY IF EXISTS "Anyone can read assignments" ON assignments;
CREATE POLICY "Users read assignments"
  ON assignments FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update RLS: Submissions - students read own, lecturers read submissions for their courses
DROP POLICY IF EXISTS "Students can read own submissions" ON submissions;
CREATE POLICY "Students read own submissions"
  ON submissions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Lecturers can read all submissions" ON submissions;
CREATE POLICY "Lecturers read own course submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.code = submissions.course_code
      AND courses.user_id = auth.uid()
    )
  );

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_courses_user ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
