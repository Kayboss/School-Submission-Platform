-- Add attachments column to assignments for lecturer-uploaded files
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Create storage bucket for assignment files (rubrics, instructions, references)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-files',
  'assignment-files',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Lecturers can upload assignment files
CREATE POLICY "Lecturers can upload assignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read assignment files (public bucket for students)
CREATE POLICY "Anyone can read assignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignment-files');

-- Lecturers can delete their own assignment files
CREATE POLICY "Lecturers can delete own assignment files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
