import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { jsonDbError, jsonError } from '@/lib/api-response';
import { createFocusLogSchema, formatZodError } from '@/lib/validation';
import type { FocusLog } from '@/types';

type FocusLogRow = {
  log_id: string;
  task_id: string | null;
  duration_seconds: number;
  session_type: string;
  created_at: string;
  tasks: { title: string } | { title: string }[] | null;
};

function taskTitleFromJoin(tasks: FocusLogRow['tasks']): string | null {
  if (!tasks) return null;
  if (Array.isArray(tasks)) return tasks[0]?.title ?? null;
  return tasks.title;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return jsonError('Unauthorized', 401);
  }

  const { data, error } = await supabase
    .from('focus_logs')
    .select(`
      log_id,
      task_id,
      duration_seconds,
      session_type,
      created_at,
      tasks ( title )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return jsonDbError('GET /api/focus-logs', error);

  const formatted: FocusLog[] = (data as FocusLogRow[] | null ?? []).map((row) => ({
    log_id: row.log_id,
    task_id: row.task_id,
    task_title: taskTitleFromJoin(row.tasks) ?? undefined,
    duration_seconds: row.duration_seconds,
    session_type: row.session_type,
    created_at: row.created_at,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return jsonError('Unauthorized', 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createFocusLogSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const { task_id, duration_seconds, session_type } = parsed.data;

  const { data, error } = await supabase
    .from('focus_logs')
    .insert([
      {
        task_id: task_id ?? null,
        duration_seconds,
        session_type,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) return jsonDbError('POST /api/focus-logs', error);
  return NextResponse.json(data, { status: 201 });
}
