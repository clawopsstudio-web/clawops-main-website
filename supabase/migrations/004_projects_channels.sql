-- Migration: 004_projects_channels
-- Creates projects, channels, and project_members tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- projects table
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  description   TEXT        DEFAULT '',
  color         TEXT        DEFAULT '#e8ff47',
  status        TEXT        DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- channels table
-- ============================================================
CREATE TABLE IF NOT EXISTS channels (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT        DEFAULT '',
  icon        TEXT        DEFAULT '#',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_private  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage channels in their own projects"
  ON channels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = channels.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = channels.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- project_members table
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id         UUID        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage membership in their own projects"
  ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- Helpers: channel count, member count per project
-- ============================================================
CREATE OR REPLACE FUNCTION get_project_stats(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  channel_count INTEGER;
  member_count  INTEGER;
BEGIN
  SELECT COUNT(*) INTO channel_count FROM channels WHERE project_id = p_id;
  SELECT COUNT(*) INTO member_count  FROM project_members WHERE project_id = p_id;
  RETURN jsonb_build_object(
    'channel_count', channel_count,
    'member_count',  member_count
  );
END;
$$;
