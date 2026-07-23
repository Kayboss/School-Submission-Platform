-- Post-interview responses table
CREATE TABLE IF NOT EXISTS post_interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  section TEXT NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add post-interview tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS post_interview_completed BOOLEAN DEFAULT false;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_post_interview_responses_user ON post_interview_responses(user_id);

-- RLS policies
ALTER TABLE post_interview_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own post-interview responses"
  ON post_interview_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own post-interview responses"
  ON post_interview_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all post-interview responses"
  ON post_interview_responses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
