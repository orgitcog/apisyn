/*
  # Roles and Permissions Schema

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Role name
      - `description` (text) - Role description
      - `permissions` (text[]) - Array of permissions
      - `created_at` (timestamptz) - Creation timestamp
      - `is_custom` (boolean) - Custom role flag
      - `priority_level` (integer) - Role priority

    - `user_roles`
      - `user_id` (uuid) - References user_profiles
      - `role_id` (uuid) - References roles
      - `created_at` (timestamptz) - Assignment timestamp

  2. Security
    - Enable RLS
    - Add policies for:
      - Reading roles (all authenticated users)
      - Reading user roles (own roles only)
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

-- Create policies
DO $$ BEGIN
  CREATE POLICY "Users can read roles"
    ON roles
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read their own roles"
    ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;