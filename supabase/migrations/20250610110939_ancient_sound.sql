/*
  # Enhanced User Stats and RevenueCat Integration

  1. New Tables
    - Enhanced `profiles` table with detailed stats tracking
    - `subscription_events` table for RevenueCat webhook events
    - `ai_generations` table to track AI mnemonic generations

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  3. Functions
    - Function to update user stats automatically
    - Function to handle subscription events
*/

-- Add subscription tracking to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'free';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_expires_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'revenue_cat_user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN revenue_cat_user_id text;
  END IF;
END $$;

-- Update stats column to include more detailed tracking
UPDATE profiles 
SET stats = jsonb_build_object(
  'streakDays', COALESCE((stats->>'streakDays')::int, 0),
  'totalStudyHours', COALESCE((stats->>'totalStudyHours')::int, 0),
  'simulatorAccuracy', COALESCE((stats->>'simulatorAccuracy')::int, 0),
  'flashcardsReviewed', COALESCE((stats->>'flashcardsReviewed')::int, 0),
  'simulatorCasesCompleted', COALESCE((stats->>'simulatorCasesCompleted')::int, 0),
  'mnemonicsCreated', COALESCE((stats->>'mnemonicsCreated')::int, 0),
  'aiGenerationsUsed', COALESCE((stats->>'aiGenerationsUsed')::int, 0),
  'lastStudyDate', COALESCE(stats->>'lastStudyDate', null),
  'totalLoginDays', COALESCE((stats->>'totalLoginDays')::int, 1)
)
WHERE stats IS NOT NULL;

-- Create subscription events table for RevenueCat webhooks
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  revenue_cat_user_id text,
  product_id text,
  transaction_id text,
  revenue_cat_data jsonb,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON subscription_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create AI generations tracking table
CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  generation_type text NOT NULL, -- 'mnemonic', 'case', etc.
  input_text text NOT NULL,
  output_text text NOT NULL,
  model_used text DEFAULT 'gpt-3.5-turbo',
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI generations"
  ON ai_generations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(
  user_id_param uuid,
  stat_type text,
  increment_value integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    stats = jsonb_set(
      stats,
      ARRAY[stat_type],
      to_jsonb(COALESCE((stats->>stat_type)::integer, 0) + increment_value)
    ),
    updated_at = now()
  WHERE id = user_id_param;
END;
$$;

-- Function to handle subscription updates
CREATE OR REPLACE FUNCTION handle_subscription_event(
  user_id_param uuid,
  event_type_param text,
  product_id_param text DEFAULT NULL,
  expires_at_param timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update subscription status
  UPDATE profiles
  SET 
    subscription_status = CASE 
      WHEN event_type_param IN ('initial_purchase', 'renewal') THEN 'pro'
      WHEN event_type_param IN ('cancellation', 'expiration') THEN 'free'
      ELSE subscription_status
    END,
    subscription_expires_at = expires_at_param,
    is_pro = CASE 
      WHEN event_type_param IN ('initial_purchase', 'renewal') THEN true
      WHEN event_type_param IN ('cancellation', 'expiration') THEN false
      ELSE is_pro
    END,
    updated_at = now()
  WHERE id = user_id_param;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);