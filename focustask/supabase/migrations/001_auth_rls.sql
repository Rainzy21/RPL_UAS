-- Migration: add user_id columns and per-user RLS (for databases created before auth)
-- Fresh installs should use supabase_schema.sql at the project root instead.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE focus_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow all on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all on focus_logs" ON focus_logs;

CREATE POLICY "Enable ALL for users based on user_id" ON tasks
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable ALL for users based on user_id" ON focus_logs
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Note: rows with NULL user_id will not appear for authenticated users after this migration.
