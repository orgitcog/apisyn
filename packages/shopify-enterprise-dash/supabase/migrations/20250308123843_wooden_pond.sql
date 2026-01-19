/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique) - User's email address
      - `display_name` (text) - User's display name
      - `avatar_url` (text) - URL to user's avatar
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `status` (text) - Account status (active/inactive)
      - `last_active` (timestamptz) - Last activity timestamp
      - `preferences` (jsonb) - User preferences
      - `timezone` (text) - User's timezone
      - `login_count` (integer) - Number of logins

  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
*/

-- Create user_profiles table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Create policies
DO $$ BEGIN
  CREATE POLICY "Users can read their own profiles"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profiles"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;