'use client';

import { useEffect } from 'react';
import { useFocusLogs } from '@/hooks/useFocusLogs';

interface Props {
  tasksCompleted: number;
  totalTasks: number;
  refreshTrigger: number;
}

function formatFocusTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  return `${m}m`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const SESSION_BADGE: Record<string, string> = {
  'Focus':       'border-white/15 text-white/60 bg-transparent',
  'Short Break': 'border-white/15 text-white/60 bg-transparent',
  'Long Break':  'border-white/15 text-white/60 bg-transparent',
};

export default function Analytics({ tasksCompleted, totalTasks, refreshTrigger }: Props) {
  const { logs, analytics, loading, fetchLogs } = useFocusLogs();

  useEffect(() => { fetchLogs(tasksCompleted); }, [fetchLogs, tasksCompleted, refreshTrigger]);

  const maxMinutes = Math.max(...analytics.weeklyMinutes.map(d => d.minutes), 1);
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Analytics & History</h2>
          <p className="text-[11px] text-white/40 mt-0.5">Last 7 days overview</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/35">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateLabel}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">

        {/* LEFT: Metrics + Chart */}
        <div className="space-y-4">
          {/* 2x2 Metric grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Focus Time Today */}
            <div className="rounded-xl bg-white/[0.03] border border-white/7 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[18px] font-bold text-white leading-none mb-0.5">
                  {formatFocusTime(analytics.focusTimeToday)}
                </p>
                <p className="text-[10px] text-white/40">Focus Time Today</p>
              </div>
            </div>

            {/* Sessions Done */}
            <div className="rounded-xl bg-white/[0.03] border border-white/7 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <p className="text-[18px] font-bold text-white leading-none mb-0.5">{analytics.sessionsDone}</p>
                <p className="text-[10px] text-white/40">Sessions Done</p>
              </div>
            </div>

            {/* Tasks Completed */}
            <div className="rounded-xl bg-white/[0.03] border border-white/7 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-[18px] font-bold text-white leading-none mb-0.5">
                  {tasksCompleted}/{totalTasks}
                </p>
                <p className="text-[10px] text-white/40">Tasks Completed</p>
              </div>
            </div>

            {/* Day Streak */}
            <div className="rounded-xl bg-white/[0.03] border border-white/7 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-[18px] font-bold text-white leading-none mb-0.5">{analytics.dayStreak}d</p>
                <p className="text-[10px] text-white/40">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-xl bg-white/[0.03] border border-white/7 p-4">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-white/30 uppercase mb-4">Focus Minutes / Day</p>
            <div className="flex items-end gap-1.5 h-20">
              {analytics.weeklyMinutes.map((day, i) => {
                const heightPct = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                const isToday = day.date === todayStr;
                const label = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                    <div className="w-full flex flex-col justify-end" style={{ height: '68px' }}>
                      <div
                        className={`w-full rounded-sm transition-all duration-700 ${isToday ? 'bg-white/80' : 'bg-white/15'}`}
                        style={{ height: `${Math.max(heightPct, day.minutes > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                    <span className={`text-[9px] ${isToday ? 'text-white/60 font-medium' : 'text-white/25'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Activity Log */}
        <div className="rounded-xl bg-white/[0.03] border border-white/7 overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-white/30 uppercase">Activity Log</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_60px_64px] px-4 py-2 border-b border-white/[0.04]">
            <span className="text-[10px] text-white/25 font-medium">SESSION</span>
            <span className="text-[10px] text-white/25 font-medium text-right">DURATION</span>
            <span className="text-[10px] text-white/25 font-medium text-right">TIME</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[11px] text-white/20">No sessions logged yet.</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-64">
              {logs.slice(0, 20).map((log, i) => (
                <div
                  key={log.log_id}
                  className={`grid grid-cols-[1fr_60px_64px] px-4 py-3 items-center
                    ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                >
                  <div className="min-w-0">
                    <span className={`badge text-[10px] mb-1 ${SESSION_BADGE[log.session_type] ?? SESSION_BADGE['Focus']}`}>
                      {log.session_type === 'Short Break' ? 'Short' :
                       log.session_type === 'Long Break' ? 'Long' : log.session_type}
                    </span>
                    {log.task_title && (
                      <p className="text-[11px] text-white/45 truncate">{log.task_title}</p>
                    )}
                  </div>
                  <span className="text-[12px] font-medium text-white/70 text-right">
                    {formatDuration(log.duration_seconds)}
                  </span>
                  <span className="text-[11px] text-white/35 text-right leading-tight">
                    {formatTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
