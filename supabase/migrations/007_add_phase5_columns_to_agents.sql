-- Add Phase 5 columns to existing agents table

ALTER TABLE agents ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS provider text DEFAULT 'custom-api-codemax-pro';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_id text DEFAULT 'claude-sonnet-4-6';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS temperature float DEFAULT 0.7;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_tokens int DEFAULT 8192;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'not_synced';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS channels jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active bool DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update subscriptions table with correct columns
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan text DEFAULT 'personal';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS agent_limit int DEFAULT 3;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tool_limit int DEFAULT 20000;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS channel_limit int DEFAULT 2;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mission_limit int DEFAULT -1;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_billing_date timestamptz;
