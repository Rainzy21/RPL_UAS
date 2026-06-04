-- Migration: allow zero-duration focus logs for "Task Done" completion events.
-- Run in Supabase SQL Editor if you created the DB from an older schema.

ALTER TABLE focus_logs DROP CONSTRAINT IF EXISTS focus_logs_duration_seconds_check;

ALTER TABLE focus_logs ADD CONSTRAINT focus_logs_duration_seconds_check CHECK (
  duration_seconds > 0
  OR (duration_seconds = 0 AND session_type = 'Task Done')
);
