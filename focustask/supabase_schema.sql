-- ============================================================
-- DeepSession — Supabase Database Setup (canonical schema)
-- Run this in your Supabase SQL Editor for new projects.
-- ============================================================

-- 1. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High')),
  estimated_hours INTEGER NOT NULL DEFAULT 1 CHECK (estimated_hours > 0),
  due_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Focus logs table
CREATE TABLE IF NOT EXISTS focus_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL CHECK (
    duration_seconds > 0
    OR (duration_seconds = 0 AND session_type = 'Task Done')
  ),
  session_type TEXT NOT NULL DEFAULT 'Focus',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date ASC);
CREATE INDEX IF NOT EXISTS idx_focus_logs_created_at ON focus_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_logs_task_id ON focus_logs(task_id);

-- 4. RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for users based on user_id" ON tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable ALL for users based on user_id" ON focus_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
