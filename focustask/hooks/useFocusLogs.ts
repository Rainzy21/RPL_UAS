'use client';

import { useState, useCallback } from 'react';
import { FocusLog, Analytics } from '@/types';

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

  const fetchLogs = useCallback(async (tasksCompleted: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/focus-logs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
      setLogs(data);

      // Compute analytics from raw logs
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayLogs = data.filter((l: FocusLog) => l.created_at.slice(0, 10) === todayStr && l.session_type === 'Focus');
      const focusTimeToday = todayLogs.reduce((s, l) => s + l.duration_seconds, 0);
      const sessionsDone = todayLogs.length;

      // Weekly data (last 7 days)
      const weeklyMinutes: { date: string; minutes: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const daySecs = data
          .filter(l => l.created_at.slice(0, 10) === dateStr && l.session_type === 'Focus')
          .reduce((s, l) => s + l.duration_seconds, 0);
        weeklyMinutes.push({ date: dateStr, minutes: Math.round(daySecs / 60) });
      }

      // Day streak
      let streak = 0;
      const checkDate = new Date();
      while (true) {
        const ds = checkDate.toISOString().slice(0, 10);
        const hasFocus = data.some(l => l.created_at.slice(0, 10) === ds && l.session_type === 'Focus');
        if (!hasFocus) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      setAnalytics({ focusTimeToday, sessionsDone, tasksCompleted, dayStreak: streak, weeklyMinutes });
    } catch (err: any) {
      console.error('Error fetching logs:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLog = useCallback(async (taskId: string | null, durationSeconds: number, sessionType: string) => {
    const res = await fetch('/api/focus-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, duration_seconds: durationSeconds, session_type: sessionType }),
    });
    const data = await res.json();
    if (res.ok) {
      setLogs(prev => [data, ...prev]);
    }
  }, []);

  return { logs, analytics, loading, fetchLogs, addLog };
}
