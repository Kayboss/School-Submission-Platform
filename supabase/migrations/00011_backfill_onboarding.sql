-- Mark all existing users as onboarding completed
-- Only NEW student signups going forward will see the onboarding wizard
UPDATE profiles SET onboarding_completed = true;

-- Also ensure all non-students have it set (safety net)
UPDATE profiles SET onboarding_completed = true WHERE role != 'student';
