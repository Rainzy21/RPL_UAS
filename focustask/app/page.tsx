"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Task, TimerMode } from "@/types";
import TaskManagement from "@/components/TaskManagement";
import FocusTimer from "@/components/FocusTimer";
import Analytics from "@/components/Analytics";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lockedTaskId, setLockedTaskId] = useState<string | null>(null);
  const [lockedTaskTitle, setLockedTaskTitle] = useState<string | null>(null);
  const [sessionLogError, setSessionLogError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleTasksChange = useCallback((t: Task[]) => setTasks(t), []);

  const handleSessionComplete = useCallback(
    async (
      mode: TimerMode,
      taskId: string | null,
      taskTitle: string | null,
      durationSeconds: number,
    ) => {
      try {
        setSessionLogError(null);
        const res = await fetch("/api/focus-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: taskId,
            duration_seconds: durationSeconds,
            session_type: mode,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save session");
        }
        if (mode === "Focus") {
          setSessionCount((n) => n + 1);
          setIsTimerRunning(false);
        }
        setAnalyticsRefresh((n) => n + 1);
      } catch (err: unknown) {
        setSessionLogError(
          err instanceof Error ? err.message : "Failed to save session",
        );
      }
    },
    [],
  );

  const tasksCompleted = tasks.filter((t) => t.is_completed).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 h-[52px] border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold text-white">
              DeepSession
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isTimerRunning && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              In Session
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-[11px] font-medium text-white/40 hover:text-white/80 hover:bg-white/5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Main scrollable area ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top row: Task (left) + Timer (right) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 p-3 lg:h-[calc(100vh-52px-180px)] lg:min-h-[500px]"
        >
          {/* Task panel */}
          <div className="panel flex flex-col min-h-[450px] lg:min-h-0">
            <TaskManagement 
              onTasksChange={handleTasksChange}
              lockedTaskId={lockedTaskId}
              onSelectTask={(id, title) => {
                if (lockedTaskId === id) {
                  setLockedTaskId(null);
                  setLockedTaskTitle(null);
                } else {
                  setLockedTaskId(id);
                  setLockedTaskTitle(title);
                }
              }}
            />
          </div>

          {/* Timer panel */}
          <div className="panel flex flex-col min-h-[450px] lg:min-h-0">
            {sessionLogError && (
              <p className="mx-4 mt-3 text-[11px] text-red-400">{sessionLogError}</p>
            )}
            <FocusTimer
              lockedTaskId={lockedTaskId}
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
