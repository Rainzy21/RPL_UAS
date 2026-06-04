import type { Analytics, FocusLog } from '@/types';

type LogRow = {
  created_at: string;
  duration_seconds: number;
  session_type: string;
};

export function computeFocusAnalytics(rows: LogRow[]): Omit<Analytics, 'tasksCompleted'> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = rows.filter(
    (l) => l.created_at.slice(0, 10) === todayStr && l.session_type === 'Focus',
  );
  const focusTimeToday = todayLogs.reduce((s, l) => s + l.duration_seconds, 0);
  const sessionsDone = todayLogs.length;

  const weeklyMinutes: { date: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const daySecs = rows
      .filter((l) => l.created_at.slice(0, 10) === dateStr && l.session_type === 'Focus')
      .reduce((s, l) => s + l.duration_seconds, 0);
    weeklyMinutes.push({ date: dateStr, minutes: Math.round(daySecs / 60) });
  }

  const focusDates = new Set(
    rows
      .filter((l) => l.session_type === 'Focus')
      .map((l) => l.created_at.slice(0, 10)),
  );

  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const ds = checkDate.toISOString().slice(0, 10);
    if (!focusDates.has(ds)) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { focusTimeToday, sessionsDone, dayStreak: streak, weeklyMinutes };
}

export type FocusLogJoinRow = {
  log_id: string;
  task_id: string | null;
  duration_seconds: number;
  session_type: string;
  created_at: string;
  tasks: { title: string } | { title: string }[] | null;
};

export function formatFocusLogRows(data: FocusLogJoinRow[]): FocusLog[] {
  return data.map((row) => {
    const taskJoin = row.tasks;
    const title =
      taskJoin && !Array.isArray(taskJoin)
        ? taskJoin.title
        : Array.isArray(taskJoin) && taskJoin[0]
          ? taskJoin[0].title
          : null;
    return {
      log_id: row.log_id,
      task_id: row.task_id,
      task_title: title ?? undefined,
      duration_seconds: row.duration_seconds,
      session_type: row.session_type,
      created_at: row.created_at,
    };
  });
}
