/*
# English Learning App — Full Schema

## Overview
Creates the complete database schema for an English learning application with:
- User profiles with study time preferences
- Grammar progress tracking (SVOMPT, ASI, QUASI)
- Error log for incorrect answers
- Film report essays with vocabulary checklist

## Tables

### 1. profiles
- `id` (uuid, PK, references auth.users) — one row per user
- `email` (text) — cached email for display
- `study_time` (text) — preferred study time: 'morning' or 'evening'
- `created_at` (timestamptz)

### 2. progress
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `topic` (text) — grammar topic: 'SVOMPT', 'ASI', 'QUASI'
- `score` (int) — current score for this topic
- `total_attempts` (int) — number of attempts
- `correct_attempts` (int) — number of correct answers
- `updated_at` (timestamptz)

### 3. error_log
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `question` (text) — the question that was answered wrong
- `user_answer` (text) — the incorrect answer given
- `correct_answer` (text) — the right answer
- `rule` (text) — the grammar rule explanation
- `topic` (text) — which topic this error belongs to
- `created_at` (timestamptz)

### 4. film_essays
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `film_title` (text) — name of the film
- `introduction` (text) — block 1: intro paragraph
- `plot_summary` (text) — block 2: plot summary
- `character_analysis` (text) — block 3: character analysis
- `theme_reflection` (text) — block 4: themes and reflection
- `vocabulary_checked` (text[]) — array of checked vocabulary items
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Security
- RLS enabled on ALL tables
- All tables are owner-scoped: each authenticated user can only access their own rows
- `user_id` columns default to `auth.uid()` so inserts work without explicitly passing the owner
- profiles table uses `id = auth.uid()` as the ownership check
- Four separate policies (SELECT, INSERT, UPDATE, DELETE) per table — no FOR ALL
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  study_time text DEFAULT 'morning',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  score int NOT NULL DEFAULT 0,
  total_attempts int NOT NULL DEFAULT 0,
  correct_attempts int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic)
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_progress" ON progress;
CREATE POLICY "select_own_progress" ON progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON progress;
CREATE POLICY "insert_own_progress" ON progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON progress;
CREATE POLICY "update_own_progress" ON progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON progress;
CREATE POLICY "delete_own_progress" ON progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Error log table
CREATE TABLE IF NOT EXISTS error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  user_answer text NOT NULL,
  correct_answer text NOT NULL,
  rule text NOT NULL,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_errors" ON error_log;
CREATE POLICY "select_own_errors" ON error_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_errors" ON error_log;
CREATE POLICY "insert_own_errors" ON error_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_errors" ON error_log;
CREATE POLICY "update_own_errors" ON error_log FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_errors" ON error_log;
CREATE POLICY "delete_own_errors" ON error_log FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Film essays table
CREATE TABLE IF NOT EXISTS film_essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  film_title text NOT NULL DEFAULT 'American History X',
  introduction text NOT NULL DEFAULT '',
  plot_summary text NOT NULL DEFAULT '',
  character_analysis text NOT NULL DEFAULT '',
  theme_reflection text NOT NULL DEFAULT '',
  vocabulary_checked text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE film_essays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_essays" ON film_essays;
CREATE POLICY "select_own_essays" ON film_essays FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_essays" ON film_essays;
CREATE POLICY "insert_own_essays" ON film_essays FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_essays" ON film_essays;
CREATE POLICY "update_own_essays" ON film_essays FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_essays" ON film_essays;
CREATE POLICY "delete_own_essays" ON film_essays FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_error_log_user_id ON error_log(user_id);
CREATE INDEX IF NOT EXISTS idx_film_essays_user_id ON film_essays(user_id);