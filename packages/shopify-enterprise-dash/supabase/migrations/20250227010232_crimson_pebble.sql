/*
  # Create stores table for Shopify Enterprise Dashboard

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text, store name)
      - `url` (text, store URL)
      - `revenue` (numeric, total revenue)
      - `orders` (integer, total orders)
      - `status` (text, store status)
      - `last_sync` (timestamptz, last synchronization time)
      - `created_at` (timestamptz, creation time)
  2. Security
    - Enable RLS on `stores` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  revenue numeric DEFAULT 0,
  orders integer DEFAULT 0,
  status text DEFAULT 'pending',
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own stores"
  ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own stores"
  ON stores
  FOR UPDATE
  TO authenticated
  USING (true);