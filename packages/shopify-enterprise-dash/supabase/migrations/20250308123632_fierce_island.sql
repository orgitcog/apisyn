/*
  # Roles and User Roles Schema

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Role name
      - `description` (text) - Role description
      - `permissions` (text[]) - Array of permission strings
      - `created_at` (timestamptz) - Creation timestamp
      - `is_custom` (boolean) - Whether role is custom or system-defined
      - `priority_level` (integer) - Role priority level
    
    - `user_roles`
      - `user_id` (uuid) - References user_profiles(id)
      - `role_id` (uuid) - References roles(id)
      - `created_at` (timestamptz) - Creation timestamp
      - Primary key is (user_id, role_id)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Reading roles (all authenticated users)
      - Reading user roles (users can read their own roles)
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  is_custom boolean DEFAULT false,
  priority_level integer DEFAULT 0
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read roles" ON roles;
    DROP POLICY IF EXISTS "Users can read their own roles" ON user_roles;
END $$;

-- Create policies
CREATE POLICY "Users can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());