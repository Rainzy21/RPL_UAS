'use client';

import { useState, useCallback } from 'react';
import { Task } from '@/types';

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks');
      setTasks(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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

    if (is_completed) {
      try {
        await fetch('/api/focus-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: id,
            duration_seconds: 1,
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
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete task');
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, error, fetchTasks, addTask, toggleTask, deleteTask };
}
