/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique) - User's email address
      - `display_name` (text) - User's display name
      - `avatar_url` (text) - Profile picture URL
      - `created_at` (timestamptz) - Account creation date
      - `updated_at` (timestamptz) - Last update timestamp
      - `status` (text) - Account status
      - `last_active` (timestamptz) - Last activity timestamp
      - `preferences` (jsonb) - User preferences
      - `timezone` (text) - User's timezone
      - `login_count` (integer) - Number of logins

  2. Security
    - Enable RLS on user_profiles table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
*/

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  last_active timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}',
  timezone text DEFAULT 'UTC',
  login_count integer DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read their own profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profiles" ON user_profiles;
END $$;

-- Create policies
CREATE POLICY "Users can read their own profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);