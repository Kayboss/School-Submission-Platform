-- Find and drop any trigger/function that auto-fills student_id with email
-- First, check what triggers exist on profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tgname, tgrelid::regclass as table_name
    FROM pg_trigger
    WHERE tgrelid = 'profiles'::regclass
      AND NOT tgisinternal
  LOOP
    RAISE NOTICE 'Found trigger: % on table %', r.tgname, r.table_name;
  END LOOP;
END $$;

-- Drop any trigger on profiles that might be auto-setting student_id
DROP TRIGGER IF EXISTS on_profile_create ON profiles;
DROP TRIGGER IF EXISTS handle_new_user ON profiles;
DROP TRIGGER IF EXISTS auto_fill_student_id ON profiles;

-- Also check for functions that might do this
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auto_fill_student_id() CASCADE;

-- Fix: clear any student_id values that incorrectly contain email addresses
UPDATE profiles SET student_id = NULL WHERE student_id LIKE '%@%';
