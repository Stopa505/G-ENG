/*
# Study sessions, streaks, and profile enhancements

## Overview
Adds study session tracking and streak support for daily learning goals.

## Tables

### study_sessions
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- date (date, not null) — the day the session happened
- minutes (int, not null) — minutes spent studying that day
- constructor_done (boolean, default false) — whether the sentence constructor was completed
- quiz_done (boolean, default false) — whether the quiz was completed
- created_at (timestamptz)

## Profile changes
- Add study_time_value (text) — stores a specific time like "07:30" from the time picker
- Add current_streak (int, default 0) — current consecutive day streak
- Add last_streak_date (date) — last date the streak was incremented

## Security
- RLS on study_sessions, owner-scoped to authenticated users
- 4 policies per table (SELECT/INSERT/UPDATE/DELETE)
*/

CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  minutes int NOT NULL DEFAULT 0,
  constructor_done boolean NOT NULL DEFAULT false,
  quiz_done boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON study_sessions;
CREATE POLICY "select_own_sessions" ON study_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON study_sessions;
CREATE POLICY "insert_own_sessions" ON study_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON study_sessions;
CREATE POLICY "update_own_sessions" ON study_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON study_sessions;
CREATE POLICY "delete_own_sessions" ON study_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);

-- Add columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'study_time_value') THEN
    ALTER TABLE profiles ADD COLUMN study_time_value text DEFAULT '07:30';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_streak') THEN
    ALTER TABLE profiles ADD COLUMN current_streak int NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_streak_date') THEN
    ALTER TABLE profiles ADD COLUMN last_streak_date date;
  END IF;
END $$;