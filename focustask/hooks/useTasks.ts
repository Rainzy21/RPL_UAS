'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/types';
import { supabase } from '@/lib/supabase';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              if (prev.find((t) => t.id === payload.new.id)) return prev;
              return [...prev, payload.new as Task].sort((a, b) =>
                a.due_date.localeCompare(b.due_date)
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? { ...t, ...(payload.new as Task) } : t
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTask = useCallback(async (
    title: string,
    priority: Task['priority'],
    estimated_hours: number,
    due_date: string
  ) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority, estimated_hours, due_date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setTasks(prev => [...prev, data].sort((a, b) => a.due_date.localeCompare(b.due_date)));
    return data;
  }, []);

  const toggleTask = useCallback(async (id: string, is_completed: boolean) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Log the task completion as an activity
    if (is_completed) {
      try {
        await fetch('/api/focus-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: id,
            duration_seconds: 1, // Minimum allowed duration by DB constraint
            session_type: 'Task Done',
          }),
        });
      } catch (err) {
        console.error('Failed to log task completion', err);
      }
    }

    setTasks(prev => prev.map(t => t.id === id ? data : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, error, fetchTasks, addTask, toggleTask, deleteTask };
}
