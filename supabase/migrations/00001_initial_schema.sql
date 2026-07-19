-- TaTU Submission Portal - Initial Schema
-- Run this in your Supabase SQL Editor

-- 1. PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer')),
  institution TEXT DEFAULT 'Tamale Technical University',
  student_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. COURSES
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  instructor TEXT NOT NULL,
  accent TEXT DEFAULT '#b35a38',
  credits TEXT DEFAULT '3.0',
  schedule TEXT,
  image TEXT
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read courses"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Lecturers can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

CREATE POLICY "Lecturers can update courses"
  ON courses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

CREATE POLICY "Lecturers can delete courses"
  ON courses FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

-- 3. ASSIGNMENTS
CREATE TABLE assignments (
  id TEXT PRIMARY KEY DEFAULT 'assign-' || gen_random_uuid(),
  course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  submission_types JSONB DEFAULT '{"document": true, "video": false, "project": false}',
  max_size INTEGER DEFAULT 10,
  allowed_extensions TEXT[] DEFAULT '{.pdf}',
  lecturer_name TEXT,
  late_penalty INTEGER DEFAULT 0,
  allow_resubmission BOOLEAN DEFAULT false,
  max_resubmissions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assignments"
  ON assignments FOR SELECT
  USING (true);

CREATE POLICY "Lecturers can insert assignments"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

CREATE POLICY "Lecturers can update assignments"
  ON assignments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

-- 4. RUBRICS
CREATE TABLE rubrics (
  id TEXT PRIMARY KEY DEFAULT 'rubric-' || gen_random_uuid(),
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  criteria JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rubrics"
  ON rubrics FOR SELECT
  USING (true);

CREATE POLICY "Lecturers can manage rubrics"
  ON rubrics FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

CREATE POLICY "Lecturers can update rubrics"
  ON rubrics FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

CREATE POLICY "Lecturers can delete rubrics"
  ON rubrics FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

-- 5. SUBMISSIONS
CREATE TABLE submissions (
  id TEXT PRIMARY KEY DEFAULT 'TaTU-' || upper(substr(md5(random()::text), 1, 9)),
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  assignment_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT now(),
  is_late BOOLEAN DEFAULT false,
  time_discrepancy TEXT,
  files JSONB DEFAULT '[]',
  video_link TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Late', 'Graded')),
  score INTEGER,
  feedback TEXT,
  rubric_scores JSONB,
  versions JSONB DEFAULT '[]',
  semester TEXT,
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own submissions"
  ON submissions FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

CREATE POLICY "Students can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lecturers can update submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer')
  );

-- 6. ACCEPTED COURSES (student enrollment)
CREATE TABLE accepted_courses (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

ALTER TABLE accepted_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own accepted courses"
  ON accepted_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can manage own accepted courses"
  ON accepted_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete own accepted courses"
  ON accepted_courses FOR DELETE
  USING (auth.uid() = user_id);

-- 7. NOTIFICATIONS
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deadline', 'graded', 'overdue', 'info')),
  title TEXT NOT NULL,
  message TEXT,
  course_code TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed Courses
INSERT INTO courses (code, name, instructor, accent, credits, schedule) VALUES
  ('IT 401', 'Advanced Software Engineering', 'Dr. John Mensah', '#b35a38', '3.0', 'Mon, Wed 10:00 AM'),
  ('IT 405', 'Data Communication & Networking', 'Eng. Sarah Boateng', '#daa520', '4.0', 'Tue, Thu 02:00 PM'),
  ('IT 302', 'Database Management Systems', 'Dr. Robert Koomson', '#4a7c59', '3.0', 'Fri 08:30 AM'),
  ('IT 408', 'Cloud Computing Architecture', 'Prof. Amara Okafor', '#6F240A', '3.0', 'Mon 01:00 PM')
ON CONFLICT (code) DO NOTHING;

-- Seed Assignments
INSERT INTO assignments (id, course_code, title, description, due_date, submission_types, max_size, allowed_extensions, lecturer_name, late_penalty, allow_resubmission, max_resubmissions) VALUES
  ('assign-1', 'IT 401', 'Final Project Submission', 'Upload your complete source code and project documentation. Ensure your project repository matches all software testing criteria.', '2026-06-25T23:59:59Z', '{"document": true, "video": false, "project": true}', 50, '{.zip, .pdf}', 'Dr. John Mensah', 5, true, 3),
  ('assign-2', 'IT 401', 'Software Design Patterns', 'Write a comprehensive report on 5 architectural patterns used in modern cloud applications.', '2026-06-12T23:59:59Z', '{"document": true, "video": false, "project": false}', 10, '{.pdf}', 'Dr. John Mensah', 5, false, 0),
  ('assign-3', 'IT 405', 'Network Topology Design', 'Submit the network design topology PDF and optionally provide a video explanation link (YouTube/Vimeo/Drive).', '2026-06-28T18:00:00Z', '{"document": true, "video": true, "project": false}', 20, '{.pdf, .docx, .pptx}', 'Eng. Sarah Boateng', 10, true, 2),
  ('assign-4', 'IT 302', 'SQL Query Optimization Exam', 'Solve the optimization questions and submit your SQL scripts. Late submissions will automatically be flagged.', '2026-06-18T12:00:00Z', '{"document": true, "video": false, "project": false}', 5, '{.sql, .pdf}', 'Dr. Robert Koomson', 0, false, 0)
ON CONFLICT (id) DO NOTHING;
