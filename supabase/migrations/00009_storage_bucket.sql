-- Create storage bucket for submission files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submission-files',
  'submission-files',
  false,
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
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
-- Students can upload files to their own folder: submission-files/{assignment_id}/{user_id}/filename
CREATE POLICY "Students can upload submission files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'submission-files'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Students can read their own uploaded files
CREATE POLICY "Students can read own submission files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submission-files'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Lecturers can read files for submissions belonging to their courses
CREATE POLICY "Lecturers can read course submission files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submission-files'
    AND EXISTS (
      SELECT 1 FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE a.user_id = auth.uid()
      AND s.user_id::text = (storage.foldername(name))[2]
    )
  );

-- Admins can read all submission files
CREATE POLICY "Admins can read all submission files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submission-files'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
