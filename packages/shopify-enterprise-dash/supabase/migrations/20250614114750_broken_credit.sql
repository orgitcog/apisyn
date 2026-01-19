/*
  # Schema and policy setup with existence checks
  
  1. New Tables
    - Creates all required tables (with IF NOT EXISTS)
    - Sets up indexes and relationships
    
  2. Security
    - Enables RLS on all tables
    - Creates policies only if they don't already exist
    
  3. Default Data
    - Adds default roles
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'active'::text,
  last_active timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}'::jsonb,
  timezone text DEFAULT 'UTC'::text,
  login_count integer DEFAULT 0
);

-- Stores Table
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  revenue numeric DEFAULT 0,
  orders integer DEFAULT 0,
  status text DEFAULT 'pending'::text,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  is_custom boolean DEFAULT false,
  priority_level integer DEFAULT 0
);

-- User Roles Junction Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Shopify Connections Table
CREATE TABLE IF NOT EXISTS public.shopify_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id),
  shop_domain text NOT NULL UNIQUE,
  access_token text NOT NULL,
  store_name text,
  store_id text,
  status text DEFAULT 'active'::text,
  created_at timestamptz DEFAULT now(),
  last_sync timestamptz
);

-- Order Summary Table
CREATE TABLE IF NOT EXISTS public.order_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text REFERENCES public.shopify_connections(shop_domain),
  total_orders integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  sync_date timestamptz DEFAULT now()
);

-- Webcontainer Tables for development environments
CREATE TABLE IF NOT EXISTS public.webcontainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['development'::text, 'testing'::text, 'staging'::text, 'production'::text])),
  parent_id uuid REFERENCES public.webcontainers(id),
  resources jsonb NOT NULL DEFAULT '{"cpu": 1, "memory": 512, "storage": 1024}'::jsonb,
  network jsonb NOT NULL DEFAULT '{"type": "bridge", "ports": []}'::jsonb,
  environment jsonb NOT NULL DEFAULT '{}'::jsonb,
  mounts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'stopped'::text CHECK (status = ANY (ARRAY['running'::text, 'stopped'::text, 'error'::text]))
);

CREATE TABLE IF NOT EXISTS public.webcontainer_nesting (
  parent_id uuid NOT NULL REFERENCES public.webcontainers(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.webcontainers(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type = ANY (ARRAY['development'::text, 'testing'::text, 'production'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS public.webcontainer_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id uuid REFERENCES public.webcontainers(id) ON DELETE CASCADE,
  cpu_usage float NOT NULL,
  memory_usage float NOT NULL,
  network_rx bigint NOT NULL DEFAULT 0,
  network_tx bigint NOT NULL DEFAULT 0,
  disk_read bigint NOT NULL DEFAULT 0,
  disk_write bigint NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webcontainer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_container uuid REFERENCES public.webcontainers(id) ON DELETE CASCADE,
  to_container uuid REFERENCES public.webcontainers(id) ON DELETE CASCADE,
  message jsonb NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles USING btree (status);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores USING btree (owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores USING btree (status);
CREATE INDEX IF NOT EXISTS idx_shopify_connections_user_id ON public.shopify_connections USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_order_summary_shop_domain ON public.order_summary USING btree (shop_domain);
CREATE INDEX IF NOT EXISTS idx_order_summary_sync_date ON public.order_summary USING btree (sync_date);
CREATE INDEX IF NOT EXISTS idx_webcontainers_parent_id ON public.webcontainers USING btree (parent_id);
CREATE INDEX IF NOT EXISTS idx_webcontainers_status ON public.webcontainers USING btree (status);
CREATE INDEX IF NOT EXISTS idx_webcontainer_metrics_container_id ON public.webcontainer_metrics USING btree (container_id);
CREATE INDEX IF NOT EXISTS idx_webcontainer_metrics_timestamp ON public.webcontainer_metrics USING btree ("timestamp");
CREATE INDEX IF NOT EXISTS idx_webcontainer_messages_from_container ON public.webcontainer_messages USING btree (from_container);
CREATE INDEX IF NOT EXISTS idx_webcontainer_messages_to_container ON public.webcontainer_messages USING btree (to_container);
CREATE INDEX IF NOT EXISTS idx_webcontainer_messages_sent_at ON public.webcontainer_messages USING btree (sent_at);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webcontainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webcontainer_nesting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webcontainer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webcontainer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies with existence checks
-- For each policy, check if it exists before creating it

-- User Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can read their own profiles'
  ) THEN
    CREATE POLICY "Users can read their own profiles" 
      ON public.user_profiles FOR SELECT 
      TO authenticated 
      USING (auth.uid() = id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can update their own profiles'
  ) THEN
    CREATE POLICY "Users can update their own profiles" 
      ON public.user_profiles FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Stores policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stores' 
    AND policyname = 'Users can create stores'
  ) THEN
    CREATE POLICY "Users can create stores" 
      ON public.stores FOR INSERT 
      TO authenticated
      WITH CHECK (owner_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stores' 
    AND policyname = 'Users can read stores they own'
  ) THEN
    CREATE POLICY "Users can read stores they own" 
      ON public.stores FOR SELECT 
      TO authenticated 
      USING (owner_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stores' 
    AND policyname = 'Users can update their own stores'
  ) THEN
    CREATE POLICY "Users can update their own stores" 
      ON public.stores FOR UPDATE 
      TO authenticated 
      USING (owner_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stores' 
    AND policyname = 'Users can delete their own stores'
  ) THEN
    CREATE POLICY "Users can delete their own stores" 
      ON public.stores FOR DELETE 
      TO authenticated 
      USING (owner_id = auth.uid());
  END IF;
END
$$;

-- Roles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'roles' 
    AND policyname = 'Users can read roles'
  ) THEN
    CREATE POLICY "Users can read roles" 
      ON public.roles FOR SELECT 
      TO authenticated 
      USING (true);
  END IF;
END
$$;

-- User Roles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can read their own roles'
  ) THEN
    CREATE POLICY "Users can read their own roles" 
      ON public.user_roles FOR SELECT 
      TO authenticated 
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Shopify Connections policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shopify_connections' 
    AND policyname = 'Users can create their own connections'
  ) THEN
    CREATE POLICY "Users can create their own connections" 
      ON public.shopify_connections FOR INSERT 
      TO authenticated 
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shopify_connections' 
    AND policyname = 'Users can view their own connections'
  ) THEN
    CREATE POLICY "Users can view their own connections" 
      ON public.shopify_connections FOR SELECT 
      TO authenticated 
      USING (user_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shopify_connections' 
    AND policyname = 'Users can update their own connections'
  ) THEN
    CREATE POLICY "Users can update their own connections" 
      ON public.shopify_connections FOR UPDATE 
      TO authenticated 
      USING (user_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shopify_connections' 
    AND policyname = 'Users can delete their own connections'
  ) THEN
    CREATE POLICY "Users can delete their own connections" 
      ON public.shopify_connections FOR DELETE 
      TO authenticated 
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Order Summary policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'order_summary' 
    AND policyname = 'Users can view related order summaries'
  ) THEN
    CREATE POLICY "Users can view related order summaries" 
      ON public.order_summary FOR SELECT 
      TO authenticated 
      USING (shop_domain IN (
        SELECT shop_domain 
        FROM public.shopify_connections 
        WHERE user_id = auth.uid()
      ));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'order_summary' 
    AND policyname = 'Users can create related order summaries'
  ) THEN
    CREATE POLICY "Users can create related order summaries" 
      ON public.order_summary FOR INSERT 
      TO authenticated 
      WITH CHECK (shop_domain IN (
        SELECT shop_domain 
        FROM public.shopify_connections 
        WHERE user_id = auth.uid()
      ));
  END IF;
END
$$;

-- Webcontainers policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainers' 
    AND policyname = 'Users can view their containers'
  ) THEN
    CREATE POLICY "Users can view their containers" 
      ON public.webcontainers FOR SELECT 
      TO authenticated 
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainers' 
    AND policyname = 'Users can manage their containers'
  ) THEN
    CREATE POLICY "Users can manage their containers" 
      ON public.webcontainers FOR ALL
      TO authenticated 
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainer_nesting' 
    AND policyname = 'Users can view container nesting'
  ) THEN
    CREATE POLICY "Users can view container nesting" 
      ON public.webcontainer_nesting FOR SELECT 
      TO authenticated 
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainer_nesting' 
    AND policyname = 'Users can manage container nesting'
  ) THEN
    CREATE POLICY "Users can manage container nesting" 
      ON public.webcontainer_nesting FOR ALL
      TO authenticated 
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainer_metrics' 
    AND policyname = 'Users can view container metrics'
  ) THEN
    CREATE POLICY "Users can view container metrics" 
      ON public.webcontainer_metrics FOR SELECT 
      TO authenticated 
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainer_metrics' 
    AND policyname = 'Users can record container metrics'
  ) THEN
    CREATE POLICY "Users can record container metrics" 
      ON public.webcontainer_metrics FOR INSERT
      TO authenticated 
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainer_messages' 
    AND policyname = 'Users can view container messages'
  ) THEN
    CREATE POLICY "Users can view container messages" 
      ON public.webcontainer_messages FOR SELECT 
      TO authenticated 
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webcontainer_messages' 
    AND policyname = 'Users can send container messages'
  ) THEN
    CREATE POLICY "Users can send container messages" 
      ON public.webcontainer_messages FOR INSERT
      TO authenticated 
      WITH CHECK (true);
  END IF;
END
$$;

-- Insert default roles
INSERT INTO public.roles (name, description, permissions, is_custom, priority_level)
VALUES 
('Admin', 'Full access to all features and settings', ARRAY['read', 'write', 'delete', 'manage_users', 'settings'], false, 100),
('Manager', 'Manage products, orders and limited settings', ARRAY['read', 'write', 'limited_settings'], false, 50),
('Editor', 'Create and manage content', ARRAY['read', 'write', 'no_settings'], false, 25),
('Analyst', 'View reports and analytics only', ARRAY['read', 'export', 'no_settings'], false, 10),
('Support', 'Handle customer inquiries and orders', ARRAY['read', 'limited_write', 'no_settings'], false, 15)
ON CONFLICT (name) DO NOTHING;