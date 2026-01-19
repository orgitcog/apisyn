/*
  # Stores Schema

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text) - Store name
      - `url` (text) - Store URL
      - `revenue` (numeric) - Total revenue
      - `orders` (integer) - Total orders
      - `status` (text) - Store status
      - `last_sync` (timestamptz) - Last sync timestamp
      - `created_at` (timestamptz) - Store creation timestamp
      - `owner_id` (uuid) - References user_profiles

  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Create stores
      - Read their own stores
      - Update their own stores
      - Delete their own stores
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
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

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);

-- Create policies
DO $$ BEGIN
  CREATE POLICY "Users can create stores"
    ON stores
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read stores they own"
    ON stores
    FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own stores"
    ON stores
    FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own stores"
    ON stores
    FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;