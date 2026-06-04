import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiError, validationError } from '@/lib/api-errors';
import {
  computeFocusAnalytics,
  formatFocusLogRows,
  type FocusLogJoinRow,
} from '@/lib/focus-analytics';
import { validateFocusLogCreate } from '@/lib/validation';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [recentResult, statsResult] = await Promise.all([
    supabase
      .from('focus_logs')
      .select(`
        log_id,
        task_id,
        duration_seconds,
        session_type,
        created_at,
        tasks ( title )
      `)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('focus_logs')
      .select('created_at, duration_seconds, session_type')
      .order('created_at', { ascending: false }),
  ]);

  if (recentResult.error) return apiError('GET /api/focus-logs (recent)', recentResult.error);
  if (statsResult.error) return apiError('GET /api/focus-logs (stats)', statsResult.error);

  const logs = formatFocusLogRows((recentResult.data ?? []) as FocusLogJoinRow[]);
  const analytics = computeFocusAnalytics(statsResult.data ?? []);

  return NextResponse.json({ logs, analytics });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError('Invalid JSON body');
  }

  const parsed = validateFocusLogCreate(body);
  if (!parsed.ok) return validationError(parsed.error);

  const { task_id, duration_seconds, session_type } = parsed.data;

  const { data, error } = await supabase
    .from('focus_logs')
    .insert([{ task_id, duration_seconds, session_type, user_id: user.id }])
    .select()
    .single();

  if (error) return apiError('POST /api/focus-logs', error);
  return NextResponse.json(data, { status: 201 });
}
