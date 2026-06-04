import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { jsonDbError, jsonError } from '@/lib/api-response';
import { createTaskSchema, formatZodError } from '@/lib/validation';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return jsonError('Unauthorized', 401);
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (error) return jsonDbError('GET /api/tasks', error);
  return NextResponse.json(data);
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

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const { title, priority, estimated_hours, due_date } = parsed.data;

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, priority, estimated_hours, due_date, user_id: user.id }])
    .select()
    .single();

  if (error) return jsonDbError('POST /api/tasks', error);
  return NextResponse.json(data, { status: 201 });
}
