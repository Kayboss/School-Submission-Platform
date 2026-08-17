-- Extend course enrollment functions so admins see enrollments across ALL courses.
-- Must run AFTER 00017_course_enrollments.sql.

-- Per-course enrollment counts: admins see all courses, lecturers see their own.
CREATE OR REPLACE FUNCTION get_course_enrollments()
RETURNS TABLE (
  course_id BIGINT,
  course_code TEXT,
  enrolled BIGINT
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.code, count(ac.user_id)::bigint AS enrolled
  FROM courses c
  LEFT JOIN accepted_courses ac ON ac.course_id = c.id
  WHERE c.user_id = auth.uid() OR get_my_role() = 'admin'
  GROUP BY c.id, c.code
  ORDER BY c.code;
$$;

REVOKE ALL ON FUNCTION get_course_enrollments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_course_enrollments() TO authenticated;

-- Student directory: admins see all students (with their course codes),
-- lecturers only see students enrolled in their own courses.
CREATE OR REPLACE FUNCTION get_course_students()
RETURNS TABLE (
  user_id UUID,
  student_id TEXT,
  name TEXT,
  email TEXT,
  course_codes TEXT[]
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    p.student_id,
    p.name,
    p.email,
    array_agg(DISTINCT c.code ORDER BY c.code) AS course_codes
  FROM profiles p
  LEFT JOIN accepted_courses ac ON ac.user_id = p.id
  LEFT JOIN courses c ON c.id = ac.course_id
  WHERE p.role = 'student'
    AND (c.user_id = auth.uid() OR get_my_role() = 'admin')
  GROUP BY p.id, p.student_id, p.name, p.email
  ORDER BY p.name;
$$;

REVOKE ALL ON FUNCTION get_course_students() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_course_students() TO authenticated;
