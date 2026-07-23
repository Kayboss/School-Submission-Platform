-- Add onboarding tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Research responses table
CREATE TABLE IF NOT EXISTS research_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_research_responses_user ON research_responses(user_id);

-- RLS: users can insert their own, admins can read all
ALTER TABLE research_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own responses"
  ON research_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own responses"
  ON research_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all responses"
  ON research_responses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
