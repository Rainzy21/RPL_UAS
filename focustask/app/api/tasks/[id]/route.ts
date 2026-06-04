import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiError, validationError } from '@/lib/api-errors';
import { validateTaskPatch } from '@/lib/validation';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationError('Invalid JSON body');
  }

  const parsed = validateTaskPatch(body);
  if (!parsed.ok) return validationError(parsed.error);

  const { data, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) return apiError('PATCH /api/tasks/[id]', error);
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) return apiError('DELETE /api/tasks/[id]', error);
  return NextResponse.json({ success: true });
}
