import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiError, validationError } from '@/lib/api-errors';
import { validateTaskCreate } from '@/lib/validation';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) return apiError('GET /api/tasks', error);
  return NextResponse.json(data);
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

  const parsed = validateTaskCreate(body);
  if (!parsed.ok) return validationError(parsed.error);

  const { title, priority, estimated_hours, due_date } = parsed.data;

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, priority, estimated_hours, due_date, user_id: user.id }])
    .select()
    .single();

  if (error) return apiError('POST /api/tasks', error);
  return NextResponse.json(data, { status: 201 });
}
