'use client';

import { useState, useCallback } from 'react';
import { Task } from '@/types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
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
      if (!res.ok) throw new Error(data.error ?? 'Failed to load tasks');
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
    setError(null);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority, estimated_hours, due_date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to add task');
    setTasks(prev => [...prev, data].sort((a, b) => a.due_date.localeCompare(b.due_date)));
    return data;
  }, []);

  const toggleTask = useCallback(async (id: string, is_completed: boolean) => {
    setError(null);
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update task');

    if (is_completed) {
      const logRes = await fetch('/api/focus-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: id,
          duration_seconds: 0,
          session_type: 'Task Done',
        }),
      });
      if (!logRes.ok) {
        const logData = await logRes.json().catch(() => ({}));
        setError(
          (logData as { error?: string }).error ??
            'Task updated but activity log could not be saved'
        );
      }
    }

    setTasks(prev => prev.map(t => t.id === id ? data : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setError(null);
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? 'Failed to delete task');
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { tasks, loading, error, clearError, fetchTasks, addTask, toggleTask, deleteTask };
}
