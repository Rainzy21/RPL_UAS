'use client';

import { useState, useCallback } from 'react';
import { Task, TimerMode } from '@/types';
import TaskManagement from '@/components/TaskManagement';
import FocusTimer from '@/components/FocusTimer';
import Analytics from '@/components/Analytics';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  'Focus': 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60,
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lockedTaskTitle] = useState<string | null>(null);

  const handleTasksChange = useCallback((t: Task[]) => setTasks(t), []);

  const handleSessionComplete = useCallback(async (
    mode: TimerMode,
    taskId: string | null,
    taskTitle: string | null
  ) => {
    try {
      await fetch('/api/focus-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          duration_seconds: TIMER_DURATIONS[mode],
          session_type: mode,
        }),
      });
      if (mode === 'Focus') { setSessionCount(n => n + 1); setIsTimerRunning(false); }
      setAnalyticsRefresh(n => n + 1);
    } catch {}
  }, []);

  const tasksCompleted = tasks.filter(t => t.is_completed).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 h-[52px] border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="text-white/40 hover:text-white/70 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-white">Task &amp; Focus Timer</span>
            <span className="text-white/20 text-[14px]">|</span>
            <span className="text-[12px] text-white/35">Productivity Suite</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isTimerRunning && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              In Session
            </div>
          )}
        </div>
      </header>

      {/* ── Main scrollable area ── */}
      <main className="flex-1 overflow-y-auto">

        {/* Top row: Task (left) + Timer (right) */}
        <div
          className="grid gap-3 p-3"
          style={{ gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 52px - 380px)' }}
        >
          {/* Task panel */}
          <div className="panel flex flex-col" style={{ minHeight: '520px' }}>
            <TaskManagement onTasksChange={handleTasksChange} />
          </div>

          {/* Timer panel */}
          <div className="panel flex flex-col" style={{ minHeight: '520px' }}>
            <FocusTimer
              lockedTaskTitle={lockedTaskTitle}
              sessionCount={sessionCount}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        </div>

        {/* Bottom: Analytics (full width) */}
        <div className="px-3 pb-3">
          <div className="panel">
            <Analytics
              tasksCompleted={tasksCompleted}
              totalTasks={tasks.length}
              refreshTrigger={analyticsRefresh}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
