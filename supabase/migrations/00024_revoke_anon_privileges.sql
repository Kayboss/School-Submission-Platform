-- Revoke unnecessary privileges from anon role on sensitive tables.
-- The anon role should not have INSERT/UPDATE/DELETE on user data tables.
-- RLS policies handle access control for authenticated users.

-- accepted_courses: only authenticated users should modify
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON accepted_courses FROM anon;

-- submissions: only authenticated users should modify
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON submissions FROM anon;
