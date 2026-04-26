-- Add model defaults to plan_config
ALTER TABLE plan_config ADD COLUMN IF NOT EXISTS default_model text;
ALTER TABLE plan_config ADD COLUMN IF NOT EXISTS default_provider text;

-- Update with correct defaults
UPDATE plan_config SET 
  default_model = 'llama-3.3-70b-versatile',
  default_provider = 'groq'
WHERE plan = 'personal';

UPDATE plan_config SET 
  default_model = 'claude-sonnet-4-6',
  default_provider = 'custom-api-codemax-pro'
WHERE plan IN ('team', 'business');
