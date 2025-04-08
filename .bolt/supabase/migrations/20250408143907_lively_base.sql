/*
  # Initial Schema Setup for SafeVoice

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text)
      - `created_at` (timestamp)
    - `stories`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `tags` (text[])
      - `created_at` (timestamp)
      - `report_count` (integer)
    - `reactions`
      - `id` (uuid, primary key)
      - `story_id` (uuid, references stories)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create stories table
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  report_count integer DEFAULT 0
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Create reactions table
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories NOT NULL,
  user_id uuid REFERENCES profiles NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id, type)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all reactions"
  ON reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reactions"
  ON reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle story reporting
CREATE OR REPLACE FUNCTION increment_report_count(story_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET report_count = report_count + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;