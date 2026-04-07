-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. onboarding_configs table
CREATE TABLE IF NOT EXISTS onboarding_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  industry TEXT,
  use_case TEXT,
  integrations JSONB,
  goals JSONB,
  step_completed INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE onboarding_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own onboarding config" ON onboarding_configs USING (auth.uid() = user_id);

-- 3. vps_instances table
CREATE TABLE IF NOT EXISTS vps_instances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  instance_id TEXT NOT NULL,
  name TEXT,
  ip_v4 TEXT,
  ip_v6 TEXT,
  product_id TEXT,
  status TEXT,
  region TEXT,
  ram_mb INTEGER,
  cpu_cores INTEGER,
  disk_mb INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vps_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own vps instances" ON vps_instances USING (auth.uid() = user_id);

-- 4. agent_configs table
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  agent_name TEXT,
  agent_type TEXT,
  skills JSONB,
  config JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own agent configs" ON agent_configs USING (auth.uid() = user_id);

-- 5. tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tasks" ON tasks USING (auth.uid() = user_id);
