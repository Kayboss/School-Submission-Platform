-- Fix accepted_courses RLS: upsert needs UPDATE permission.
-- The existing INSERT-only policy blocks upsert when the row already exists.
-- Replace with a single ALL policy covering SELECT, INSERT, UPDATE, DELETE.

DROP POLICY IF EXISTS "Students can delete own accepted courses" ON accepted_courses;
DROP POLICY IF EXISTS "Students can manage own accepted courses" ON accepted_courses;
DROP POLICY IF EXISTS "Students can read own accepted courses" ON accepted_courses;

CREATE POLICY "Users can manage own accepted courses"
  ON accepted_courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
