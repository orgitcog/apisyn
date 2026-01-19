/*
  # Webcontainer System Schema

  1. New Tables
    - `webcontainers`: Main container configuration and state
    - `webcontainer_nesting`: Parent-child relationships between containers
    - `webcontainer_metrics`: Container performance metrics
    - `webcontainer_messages`: Inter-container communication

  2. Security
    - Enable RLS on all tables
    - Add policies for container access and management
*/

-- Create webcontainers table
CREATE TABLE IF NOT EXISTS webcontainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('development', 'testing', 'staging', 'production')),
  parent_id uuid REFERENCES webcontainers(id),
  resources jsonb NOT NULL DEFAULT '{"cpu": 1, "memory": 512, "storage": 1024}',
  network jsonb NOT NULL DEFAULT '{"type": "bridge", "ports": []}',
  environment jsonb NOT NULL DEFAULT '{}',
  mounts jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error'))
);

-- Create webcontainer_nesting table
CREATE TABLE IF NOT EXISTS webcontainer_nesting (
  parent_id uuid REFERENCES webcontainers(id) ON DELETE CASCADE,
  child_id uuid REFERENCES webcontainers(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('development', 'testing', 'production')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, child_id)
);

-- Create webcontainer_metrics table
CREATE TABLE IF NOT EXISTS webcontainer_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id uuid REFERENCES webcontainers(id) ON DELETE CASCADE,
  cpu_usage float NOT NULL,
  memory_usage float NOT NULL,
  network_rx bigint NOT NULL DEFAULT 0,
  network_tx bigint NOT NULL DEFAULT 0,
  disk_read bigint NOT NULL DEFAULT 0,
  disk_write bigint NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create webcontainer_messages table
CREATE TABLE IF NOT EXISTS webcontainer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_container uuid REFERENCES webcontainers(id) ON DELETE CASCADE,
  to_container uuid REFERENCES webcontainers(id) ON DELETE CASCADE,
  message jsonb NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE webcontainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webcontainer_nesting ENABLE ROW LEVEL SECURITY;
ALTER TABLE webcontainer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webcontainer_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their containers"
  ON webcontainers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their containers"
  ON webcontainers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view container nesting"
  ON webcontainer_nesting
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage container nesting"
  ON webcontainer_nesting
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view container metrics"
  ON webcontainer_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can record container metrics"
  ON webcontainer_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view container messages"
  ON webcontainer_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can send container messages"
  ON webcontainer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_webcontainers_parent_id ON webcontainers(parent_id);
CREATE INDEX idx_webcontainers_status ON webcontainers(status);
CREATE INDEX idx_webcontainer_metrics_container_id ON webcontainer_metrics(container_id);
CREATE INDEX idx_webcontainer_metrics_timestamp ON webcontainer_metrics(timestamp);
CREATE INDEX idx_webcontainer_messages_from_container ON webcontainer_messages(from_container);
CREATE INDEX idx_webcontainer_messages_to_container ON webcontainer_messages(to_container);
CREATE INDEX idx_webcontainer_messages_sent_at ON webcontainer_messages(sent_at);