-- Create research summaries table
CREATE TABLE IF NOT EXISTS research_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  paper_title text NOT NULL,
  paper_author text,
  paper_year integer,
  original_text text NOT NULL,
  summary_text text NOT NULL,
  chunk_length integer NOT NULL,
  summary_min_length integer NOT NULL,
  summary_max_length integer NOT NULL,
  model_used text DEFAULT 'facebook/bart-large-cnn',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE research_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own research summaries"
  ON research_summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research summaries"
  ON research_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research summaries"
  ON research_summaries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own research summaries"
  ON research_summaries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_summaries_user_id ON research_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_research_summaries_created_at ON research_summaries(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_research_summaries_updated_at
    BEFORE UPDATE ON research_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add research summaries count to user stats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stats'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stats jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update stats to include research summaries count
UPDATE profiles 
SET stats = jsonb_set(
  stats,
  ARRAY['researchSummariesCreated'],
  to_jsonb(COALESCE((stats->>'researchSummariesCreated')::int, 0))
)
WHERE stats IS NOT NULL; 