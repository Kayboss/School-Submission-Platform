-- Check column definition for student_id
SELECT column_name, column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'student_id';

-- Check what's currently stored
SELECT id, name, email, student_id FROM profiles LIMIT 10;
