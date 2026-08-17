-- Add attachments column to courses for lecturer-uploaded files (syllabus, outline, etc.)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
