import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  notify_email: boolean;
  notify_push: boolean;
  created_at: string;
};

export type Analysis = {
  id: string;
  user_id: string;
  input_type: 'text' | 'url' | 'file';
  title: string | null;
  content: string;
  source_url: string | null;
  verdict: 'Real' | 'Fake' | 'Uncertain';
  confidence: number;
  explanation: string | null;
  bias_score: number;
  emotional_tone: string | null;
  summary: string | null;
  fact_check_keywords: string[];
  manipulation_indicators: string[];
  processing_time_ms: number;
  bookmarked: boolean;
  created_at: string;
};
