'use client';

import { useState, useCallback } from 'react';
import { FocusLog, Analytics } from '@/types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export function useFocusLogs() {
  const [logs, setLogs] = useState<FocusLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    focusTimeToday: 0,
    sessionsDone: 0,
    tasksCompleted: 0,
    dayStreak: 0,
    weeklyMinutes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (tasksCompleted: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/focus-logs');
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? 'Failed to fetch logs');
      }
      const logs = data as FocusLog[];
      setLogs(logs);

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayLogs = logs.filter(
        (l) => l.created_at.slice(0, 10) === todayStr && l.session_type === 'Focus'
      );
      const focusTimeToday = todayLogs.reduce((s, l) => s + l.duration_seconds, 0);
      const sessionsDone = todayLogs.length;

      const weeklyMinutes: { date: string; minutes: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const daySecs = logs
          .filter((l) => l.created_at.slice(0, 10) === dateStr && l.session_type === 'Focus')
          .reduce((s, l) => s + l.duration_seconds, 0);
        weeklyMinutes.push({ date: dateStr, minutes: Math.round(daySecs / 60) });
      }

      let streak = 0;
      const checkDate = new Date();
      while (true) {
        const ds = checkDate.toISOString().slice(0, 10);
        const hasFocus = logs.some(
          (l) => l.created_at.slice(0, 10) === ds && l.session_type === 'Focus'
        );
        if (!hasFocus) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      setAnalytics({
        focusTimeToday,
        sessionsDone,
        tasksCompleted,
        dayStreak: streak,
        weeklyMinutes,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addLog = useCallback(
    async (taskId: string | null, durationSeconds: number, sessionType: string) => {
      setError(null);
      const res = await fetch('/api/focus-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          duration_seconds: durationSeconds,
          session_type: sessionType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Failed to save session');
        return;
      }
      setLogs((prev) => [data as FocusLog, ...prev]);
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { logs, analytics, loading, error, clearError, fetchLogs, addLog };
}
