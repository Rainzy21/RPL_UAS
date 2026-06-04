'use client';

import { useState, useCallback } from 'react';
import { Task } from '@/types';

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
    setTasks(prev => prev.map(t => t.id === id ? data : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, error, fetchTasks, addTask, toggleTask, deleteTask };
}
