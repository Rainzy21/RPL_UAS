import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) return NextResponse.json([], { status: 200 });

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
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const formatted = (data || []).map((row: any) => ({
    log_id: row.log_id,
    task_id: row.task_id,
    task_title: row.tasks?.title || null,
    duration_seconds: row.duration_seconds,
    session_type: row.session_type,
    created_at: row.created_at,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const body = await req.json();
  const { task_id, duration_seconds, session_type } = body;

  const { data, error } = await supabase
    .from('focus_logs')
    .insert([{ task_id: task_id || null, duration_seconds, session_type }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
