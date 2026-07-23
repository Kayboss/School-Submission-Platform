-- Create public storage bucket for course images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Anyone can read course images (public bucket)
CREATE POLICY "Public can read course images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-images');

-- Lecturers and admins can upload course images
CREATE POLICY "Lecturers and admins can upload course images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-images'
    AND get_my_role() IN ('lecturer', 'admin')
  );

-- Lecturers and admins can update course images
CREATE POLICY "Lecturers and admins can update course images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course-images'
    AND get_my_role() IN ('lecturer', 'admin')
  );

-- Lecturers and admins can delete course images
CREATE POLICY "Lecturers and admins can delete course images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-images'
    AND get_my_role() IN ('lecturer', 'admin')
  );
