-- Revoke anon write privileges from all remaining sensitive tables.
-- Supabase grants ALL on public tables by default. With RLS enabled,
-- anon should only need SELECT (which is already blocked by RLS policies
-- requiring auth.uid()). No unauthenticated user should write to these tables.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON activity_log FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON assignments FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON courses FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON notifications FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON post_interview_responses FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON research_responses FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON rubrics FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON user_sessions FROM anon;
