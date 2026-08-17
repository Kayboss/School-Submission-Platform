-- Let lecturers see how many students are registered for their courses.
-- SECURITY DEFINER is used because RLS blocks lecturers from reading
-- accepted_courses / profiles directly, and naive cross-table policies
-- risk infinite recursion (see 00012_drop_recursive_policy.sql).

-- Per-course enrollment counts for the calling lecturer's own courses.
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
  WHERE c.user_id = auth.uid()
  GROUP BY c.id, c.code
  ORDER BY c.code;
$$;

REVOKE ALL ON FUNCTION get_course_enrollments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_course_enrollments() TO authenticated;

-- Student directory (name, email, enrolled course codes) limited to the
-- calling lecturer's own courses.
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
    array_agg(c.code ORDER BY c.code) AS course_codes
  FROM accepted_courses ac
  JOIN profiles p ON p.id = ac.user_id
  JOIN courses c ON c.id = ac.course_id
  WHERE c.user_id = auth.uid()
  GROUP BY p.id, p.student_id, p.name, p.email
  ORDER BY p.name;
$$;

REVOKE ALL ON FUNCTION get_course_students() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_course_students() TO authenticated;
