-- Security hardening round 2: fixes for CRITICAL + HIGH findings from full audit.

-- =========================================================
-- CRITICAL 1 & 2: Prevent privilege escalation on profiles.
--   - INSERT: only admins may create profiles with role 'admin'.
--   - UPDATE: only admins may change a user's role.
--   Bypasses for direct DB / service_role sessions (auth.uid() IS NULL).
-- =========================================================
CREATE OR REPLACE FUNCTION prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' AND get_my_role() IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Only admins can assign the admin role';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND get_my_role() IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_role_guard ON profiles;
CREATE TRIGGER profile_role_guard
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_role_escalation();

-- =========================================================
-- HIGH: Lecturers may only grade submissions for courses they
--       own (admins may grade any). Replaces the role-only policy.
-- =========================================================
DROP POLICY IF EXISTS "Lecturers can update submissions" ON submissions;
DROP POLICY IF EXISTS "Lecturers can update own course submissions" ON submissions;
CREATE POLICY "Lecturers can update own course submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.code = submissions.course_code
        AND (courses.user_id = auth.uid() OR get_my_role() = 'admin')
    )
  );

-- =========================================================
-- HIGH: Only lecturers/admins may upload or delete files in the
--       assignment-files bucket (was role-unchecked).
-- =========================================================
DROP POLICY IF EXISTS "Lecturers can upload assignment files" ON storage.objects;
CREATE POLICY "Lecturers can upload assignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND get_my_role() = ANY (ARRAY['lecturer'::text, 'admin'::text])
  );

DROP POLICY IF EXISTS "Lecturers can delete own assignment files" ON storage.objects;
CREATE POLICY "Lecturers can delete own assignment files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND get_my_role() = ANY (ARRAY['lecturer'::text, 'admin'::text])
  );

-- =========================================================
-- HIGH: Rubrics should only be readable by authenticated users
--       (was "Anyone can read rubrics" -> anon + everyone).
-- =========================================================
DROP POLICY IF EXISTS "Anyone can read rubrics" ON rubrics;
DROP POLICY IF EXISTS "Authenticated users can read rubrics" ON rubrics;
CREATE POLICY "Authenticated users can read rubrics"
  ON rubrics FOR SELECT
  USING (auth.uid() IS NOT NULL);
