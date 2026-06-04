'use client';

import { useState, useCallback } from 'react';
import { FocusLog, Analytics } from '@/types';

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

const emptyAnalytics: Omit<Analytics, 'tasksCompleted'> = {
  focusTimeToday: 0,
  sessionsDone: 0,
  dayStreak: 0,
  weeklyMinutes: [],
};

export function useFocusLogs() {
  const [logs, setLogs] = useState<FocusLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    ...emptyAnalytics,
    tasksCompleted: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (tasksCompleted: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/focus-logs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
      setLogs(data.logs ?? []);
      setAnalytics({
        ...(data.analytics ?? emptyAnalytics),
        tasksCompleted,
      });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      console.error('Error fetching logs:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, analytics, loading, error, fetchLogs };
}
