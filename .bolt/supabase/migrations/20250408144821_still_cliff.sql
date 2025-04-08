/*
  # SafeVoice Database Schema

  1. Tables
    - profiles (user profiles)
    - stories (user stories with user_id)
    - reactions (story reactions)
  
  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access
    
  3. Functions
    - increment_report_count for story reporting
*/

-- Safely create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read all profiles'
  ) THEN
    CREATE POLICY "Users can read all profiles"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Safely create stories table if it doesn't exist
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  report_count integer DEFAULT 0
);

-- Enable RLS and create policies for stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Anyone can read stories'
  ) THEN
    CREATE POLICY "Anyone can read stories"
      ON stories
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can create stories'
  ) THEN
    CREATE POLICY "Users can create stories"
      ON stories
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Safely create reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories NOT NULL,
  user_id uuid REFERENCES profiles NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id, type)
);

-- Enable RLS and create policies for reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can read all reactions'
  ) THEN
    CREATE POLICY "Users can read all reactions"
      ON reactions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can create reactions'
  ) THEN
    CREATE POLICY "Users can create reactions"
      ON reactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can delete own reactions'
  ) THEN
    CREATE POLICY "Users can delete own reactions"
      ON reactions
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace the report count function
CREATE OR REPLACE FUNCTION increment_report_count(story_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET report_count = report_count + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;