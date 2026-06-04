export interface Task {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  estimated_hours: number;
  due_date: string;
  is_completed: boolean;
  created_at: string;
}

export interface FocusLog {
  log_id: string;
  task_id: string | null;
  task_title?: string;
  duration_seconds: number;
  session_type: string;
  created_at: string;
}

export type TimerMode = 'Focus' | 'Short Break' | 'Long Break';

export interface TimerState {
  mode: TimerMode;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  lockedTaskId: string | null;
  lockedTaskTitle: string | null;
}

export interface Analytics {
  focusTimeToday: number;
  sessionsDone: number;
  tasksCompleted: number;
  dayStreak: number;
  weeklyMinutes: { date: string; minutes: number }[];
}
