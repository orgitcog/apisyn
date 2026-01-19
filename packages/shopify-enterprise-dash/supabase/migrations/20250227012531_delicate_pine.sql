/*
  # User profile enhancements
  
  1. Changes:
     - Add status column to user_profiles
     - Add preferences column (JSONB) to user_profiles
     - Add timezone column to user_profiles 
     - Add login tracking columns to user_profiles
     - Create index on status column for faster lookups
     - Add helper function for updating last_active timestamp
  
  2. Safety Features:
     - All operations are wrapped in conditional checks
     - Will only execute if columns don't already exist
     - Safe to run multiple times
*/

-- First ensure user_profiles table exists, creating if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      display_name text,
      avatar_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add last_active column if it doesn't exist (needed for the trigger function)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'last_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_active TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Safely add other columns if they don't exist already
DO $$ 
BEGIN
  -- Add preference column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add timezone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;
  
  -- Add login_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'login_count'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN login_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index for faster user lookup if it doesn't exist already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'user_profiles' AND indexname = 'idx_user_profiles_status'
  ) THEN
    CREATE INDEX idx_user_profiles_status ON user_profiles(status);
  END IF;
END $$;

-- Create helper function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = now();
  NEW.login_count = OLD.login_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_last_active_trigger'
  ) THEN
    CREATE TRIGGER update_user_last_active_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    WHEN (OLD.id IS NOT NULL)
    EXECUTE FUNCTION update_user_last_active();
  END IF;
EXCEPTION
  -- Handle case where trigger might exist but with different definition
  WHEN OTHERS THEN
    NULL;
END $$;