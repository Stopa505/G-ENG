'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Topic = 'SVOMPT' | 'ASI' | 'QUASI';

export type StudyTime = 'morning' | 'evening';

export interface Profile {
  id: string;
  email: string | null;
  study_time: StudyTime;
  study_time_value: string | null;
  current_streak: number;
  last_streak_date: string | null;
  created_at: string;
}

export interface ProgressRow {
  id: string;
  user_id: string;
  topic: Topic;
  score: number;
  total_attempts: number;
  correct_attempts: number;
  updated_at: string;
}

export interface ErrorLogRow {
  id: string;
  user_id: string;
  question: string;
  user_answer: string;
  correct_answer: string;
  rule: string;
  topic: Topic;
  created_at: string;
}

export interface FilmEssay {
  id: string;
  user_id: string;
  film_title: string;
  introduction: string;
  plot_summary: string;
  character_analysis: string;
  theme_reflection: string;
  vocabulary_checked: string[];
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  date: string;
  minutes: number;
  constructor_done: boolean;
  quiz_done: boolean;
  created_at: string;
}
