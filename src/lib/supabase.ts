import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          is_pro: boolean;
          created_at: string;
          updated_at: string;
          stats: {
            simulatorAccuracy: number;
            flashcardsReviewed: number;
            streakDays: number;
            totalStudyHours: number;
          };
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          is_pro?: boolean;
          stats?: any;
        };
        Update: {
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          is_pro?: boolean;
          updated_at?: string;
          stats?: any;
        };
      };
      patient_cases: {
        Row: {
          id: string;
          user_id: string;
          case_data: any;
          diagnosis_submitted: string | null;
          is_correct: boolean | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          case_data: any;
          diagnosis_submitted?: string | null;
          is_correct?: boolean | null;
          completed_at?: string | null;
        };
        Update: {
          diagnosis_submitted?: string | null;
          is_correct?: boolean | null;
          completed_at?: string | null;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          front: string;
          back: string;
          tags: string[];
          difficulty: number;
          last_reviewed: string;
          next_review: string;
          correct_count: number;
          incorrect_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          front: string;
          back: string;
          tags?: string[];
          difficulty?: number;
          last_reviewed?: string;
          next_review?: string;
          correct_count?: number;
          incorrect_count?: number;
        };
        Update: {
          front?: string;
          back?: string;
          tags?: string[];
          difficulty?: number;
          last_reviewed?: string;
          next_review?: string;
          correct_count?: number;
          incorrect_count?: number;
        };
      };
      deadlines: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string;
          category: string;
          priority: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          due_date: string;
          category: string;
          priority: string;
          is_completed?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string;
          category?: string;
          priority?: string;
          is_completed?: boolean;
        };
      };
      mnemonics: {
        Row: {
          id: string;
          user_id: string;
          term: string;
          mnemonic: string;
          explanation: string | null;
          category: string;
          tags: string[];
          is_custom: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          term: string;
          mnemonic: string;
          explanation?: string | null;
          category: string;
          tags?: string[];
          is_custom?: boolean;
        };
        Update: {
          term?: string;
          mnemonic?: string;
          explanation?: string | null;
          category?: string;
          tags?: string[];
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          start_time: string;
          end_time: string | null;
          correct_answers: number;
          incorrect_answers: number;
          total_questions: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          session_type: string;
          start_time?: string;
          end_time?: string | null;
          correct_answers?: number;
          incorrect_answers?: number;
          total_questions?: number;
        };
        Update: {
          end_time?: string | null;
          correct_answers?: number;
          incorrect_answers?: number;
          total_questions?: number;
        };
      };
    };
  };
};