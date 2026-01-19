/*
  # Create Shopify store connections tables

  1. New Tables
    - `shopify_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `shop_domain` (text, unique)
      - `access_token` (text)
      - `store_name` (text)
      - `store_id` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `last_sync` (timestamp)
    - `order_summary`
      - `id` (uuid, primary key)
      - `shop_domain` (text, foreign key to shopify_connections)
      - `total_orders` (integer)
      - `total_revenue` (numeric)
      - `sync_date` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create shopify_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS shopify_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  shop_domain text UNIQUE NOT NULL,
  access_token text NOT NULL,
  store_name text,
  store_id text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  last_sync timestamptz
);

-- Create order_summary table
CREATE TABLE IF NOT EXISTS order_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text REFERENCES shopify_connections(shop_domain),
  total_orders integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  sync_date timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for shopify_connections
CREATE POLICY "Users can view their own connections"
  ON shopify_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connections"
  ON shopify_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON shopify_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON shopify_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for order_summary
CREATE POLICY "Users can view related order summaries"
  ON order_summary
  FOR SELECT
  TO authenticated
  USING (
    shop_domain IN (
      SELECT shop_domain FROM shopify_connections 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create related order summaries"
  ON order_summary
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_domain IN (
      SELECT shop_domain FROM shopify_connections 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_connections_user_id 
  ON shopify_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_order_summary_shop_domain 
  ON order_summary(shop_domain);

CREATE INDEX IF NOT EXISTS idx_order_summary_sync_date 
  ON order_summary(sync_date);