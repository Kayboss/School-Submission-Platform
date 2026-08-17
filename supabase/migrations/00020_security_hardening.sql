-- Security hardening from `supabase db advisors` run.
-- Restrict SECURITY DEFINER functions to authenticated users only (revoke anon/PUBLIC),
-- and pin search_path so object resolution can't be hijacked.

REVOKE ALL ON FUNCTION get_my_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_course_enrollments() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_course_students() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION rls_auto_enable() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_enrollments() TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_students() TO authenticated;

ALTER FUNCTION get_my_role() SET search_path = public;
ALTER FUNCTION rls_auto_enable() SET search_path = public;
