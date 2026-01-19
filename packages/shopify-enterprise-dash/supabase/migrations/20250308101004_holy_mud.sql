/*
  # Initial Schema Setup

  1. New Tables
    - `user_profiles`: Store user information and preferences
    - `stores`: Manage connected Shopify stores
    - `roles`: Define user roles and permissions
    - `user_roles`: Junction table for user-role assignments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up role-based access control

  3. Changes
    - Create initial tables with proper constraints
    - Set up security policies
    - Add indexes for performance
    - Insert default roles
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS user_profiles;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
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

-- Create stores table
CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  revenue numeric DEFAULT 0,
  orders integer DEFAULT 0,
  status text DEFAULT 'pending',
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Create roles table with unique name constraint
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  is_custom boolean DEFAULT false,
  priority_level integer DEFAULT 0
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_status ON stores(status);

-- Create policies for user_profiles
DO $$ BEGIN
  CREATE POLICY "Users can read their own profiles"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profiles"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create policies for stores
DO $$ BEGIN
  CREATE POLICY "Users can read stores they own"
    ON stores
    FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create stores"
    ON stores
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own stores"
    ON stores
    FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own stores"
    ON stores
    FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create policies for roles
DO $$ BEGIN
  CREATE POLICY "Users can read roles"
    ON roles
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create policies for user_roles
DO $$ BEGIN
  CREATE POLICY "Users can read their own roles"
    ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_custom, priority_level)
VALUES 
  ('Admin', 'Full system access', '{all}', false, 100),
  ('Manager', 'Store management access', '{read,write,manage_stores}', false, 50),
  ('Staff', 'Basic access', '{read}', false, 10)
ON CONFLICT (name) DO NOTHING;