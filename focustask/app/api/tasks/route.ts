import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const body = await req.json();
  const { title, priority = 'Medium', estimated_hours = 1, due_date } = body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due_date);
  if (dueDate < today) {
    return NextResponse.json({ error: 'Due date cannot be in the past' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, priority, estimated_hours, due_date }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
