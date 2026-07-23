-- Add metadata column to user_sessions for device/location tracking
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
