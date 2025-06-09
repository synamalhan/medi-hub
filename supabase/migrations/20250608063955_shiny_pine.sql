/*
  # Initial MediHub Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `is_pro` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `stats` (jsonb for user statistics)

    - `patient_cases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `case_data` (jsonb for complete case information)
      - `diagnosis_submitted` (text, optional)
      - `is_correct` (boolean, optional)
      - `completed_at` (timestamp, optional)
      - `created_at` (timestamp)

    - `flashcards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `front` (text)
      - `back` (text)
      - `tags` (text array)
      - `difficulty` (integer, default 1)
      - `last_reviewed` (timestamp)
      - `next_review` (timestamp)
      - `correct_count` (integer, default 0)
      - `incorrect_count` (integer, default 0)
      - `created_at` (timestamp)

    - `deadlines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamp)
      - `category` (text)
      - `priority` (text)
      - `is_completed` (boolean, default false)
      - `created_at` (timestamp)

    - `mnemonics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `term` (text)
      - `mnemonic` (text)
      - `explanation` (text)
      - `category` (text)
      - `tags` (text array)
      - `is_custom` (boolean, default true)
      - `created_at` (timestamp)

    - `study_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_type` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `correct_answers` (integer, default 0)
      - `incorrect_answers` (integer, default 0)
      - `total_questions` (integer, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  is_pro boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  stats jsonb DEFAULT '{
    "simulatorAccuracy": 0,
    "flashcardsReviewed": 0,
    "streakDays": 0,
    "totalStudyHours": 0
  }'::jsonb
);

-- Create patient_cases table
CREATE TABLE IF NOT EXISTS patient_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  case_data jsonb NOT NULL,
  diagnosis_submitted text,
  is_correct boolean,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  tags text[] DEFAULT '{}',
  difficulty integer DEFAULT 1,
  last_reviewed timestamptz DEFAULT now(),
  next_review timestamptz DEFAULT (now() + interval '1 day'),
  correct_count integer DEFAULT 0,
  incorrect_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  category text NOT NULL,
  priority text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create mnemonics table
CREATE TABLE IF NOT EXISTS mnemonics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  term text NOT NULL,
  mnemonic text NOT NULL,
  explanation text,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  is_custom boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  correct_answers integer DEFAULT 0,
  incorrect_answers integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE mnemonics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for patient_cases
CREATE POLICY "Users can manage own patient cases"
  ON patient_cases
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for flashcards
CREATE POLICY "Users can manage own flashcards"
  ON flashcards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for deadlines
CREATE POLICY "Users can manage own deadlines"
  ON deadlines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for mnemonics
CREATE POLICY "Users can manage own mnemonics"
  ON mnemonics
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for study_sessions
CREATE POLICY "Users can manage own study sessions"
  ON study_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some default mnemonics
INSERT INTO mnemonics (user_id, term, mnemonic, explanation, category, tags, is_custom) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Cranial Nerves', 'Oh Oh Oh To Touch And Feel Very Good Velvet And Hair', 'Olfactory, Optic, Oculomotor, Trochlear, Trigeminal, Abducens, Facial, Vestibulocochlear, Glossopharyngeal, Vagus, Accessory, Hypoglossal', 'Anatomy', '{"cranial nerves", "neurology"}', false),
  ('00000000-0000-0000-0000-000000000000', 'Heart Murmur Locations', 'All People Eat Tacos', 'Aortic, Pulmonic, Erb''s point, Tricuspid, Mitral', 'Cardiology', '{"heart sounds", "physical exam"}', false),
  ('00000000-0000-0000-0000-000000000000', 'Carpal Bones', 'Some Lovers Try Positions That They Cannot Handle', 'Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate', 'Anatomy', '{"orthopedics", "hand"}', false)
ON CONFLICT DO NOTHING;