-- Clear all data except profiles (user accounts)
-- Run this in Supabase SQL Editor

DELETE FROM notifications;
DELETE FROM accepted_courses;
DELETE FROM submissions;
DELETE FROM rubrics;
DELETE FROM assignments;
DELETE FROM courses;

-- Verify tables are empty
SELECT 'notifications' as tbl, count(*) as rows FROM notifications
UNION ALL SELECT 'accepted_courses', count(*) FROM accepted_courses
UNION ALL SELECT 'submissions', count(*) FROM submissions
UNION ALL SELECT 'rubrics', count(*) FROM rubrics
UNION ALL SELECT 'assignments', count(*) FROM assignments
UNION ALL SELECT 'courses', count(*) FROM courses
UNION ALL SELECT 'profiles', count(*) FROM profiles;
