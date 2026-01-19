/*
  # Create user profiles and role tables
  
  1. New Tables
     - `user_profiles`: Stores user profile information
       - `id` (uuid, primary key)
       - `email` (text, unique)
       - `display_name` (text)
       - `avatar_url` (text)
       - `created_at` (timestamp)
       - `updated_at` (timestamp)
     - `roles`: Stores available roles in the system
       - `id` (uuid, primary key)
       - `name` (text, unique)
       - `description` (text)
       - `permissions` (text array)
       - `created_at` (timestamp)
     - `user_roles`: Junction table for many-to-many relationship
       - `user_id` (uuid, references user_profiles)
       - `role_id` (uuid, references roles)
       - `created_at` (timestamp)
  
  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users
*/

-- Create user_profiles table first
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table with proper references
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Enable row level security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
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

-- Create policies for roles
CREATE POLICY "Users can read all roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_roles
CREATE POLICY "Users can read all user_roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('Administrator', 'Full access to all features and settings', '{read,write,delete,manage_users}'),
  ('Manager', 'Manage store operations and limited user management', '{read,write,limited_user_management}'),
  ('Staff', 'Regular staff with basic access privileges', '{read,limited_write}')
ON CONFLICT (name) DO NOTHING;