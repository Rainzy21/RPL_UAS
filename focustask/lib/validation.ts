import type { Task } from '@/types';

const PRIORITIES: Task['priority'][] = ['Low', 'Medium', 'High'];
const SESSION_TYPES = ['Focus', 'Short Break', 'Long Break', 'Task Done'] as const;

export type TaskCreateInput = {
  title: string;
  priority: Task['priority'];
  estimated_hours: number;
  due_date: string;
};

export type TaskPatchInput = Partial<{
  title: string;
  priority: Task['priority'];
  estimated_hours: number;
  due_date: string;
  is_completed: boolean;
}>;

export type FocusLogCreateInput = {
  task_id: string | null;
  duration_seconds: number;
  session_type: string;
};

function isNonEmptyString(value: unknown, maxLen: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLen;
}

function parseDueDate(due_date: unknown): string | null {
  if (typeof due_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return null;
  }
  const due = new Date(`${due_date}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  return due_date;
}

function dueDateNotInPast(due_date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${due_date}T00:00:00`);
  return due >= today;
}

export function validateTaskCreate(body: unknown):
  | { ok: true; data: TaskCreateInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }
  const { title, priority, estimated_hours, due_date } = body as Record<string, unknown>;

  if (!isNonEmptyString(title, 500)) {
    return { ok: false, error: 'Title is required (max 500 characters)' };
  }

  const resolvedPriority =
    priority === undefined ? 'Medium' : priority;
  if (
    typeof resolvedPriority !== 'string' ||
    !PRIORITIES.includes(resolvedPriority as Task['priority'])
  ) {
    return { ok: false, error: 'Priority must be Low, Medium, or High' };
  }

  const hours = estimated_hours === undefined ? 1 : Number(estimated_hours);
  if (!Number.isInteger(hours) || hours < 1 || hours > 24) {
    return { ok: false, error: 'Estimated hours must be an integer between 1 and 24' };
  }

  const parsedDue = parseDueDate(due_date);
  if (!parsedDue) {
    return { ok: false, error: 'Due date is required (YYYY-MM-DD)' };
  }
  if (!dueDateNotInPast(parsedDue)) {
    return { ok: false, error: 'Due date cannot be in the past' };
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      priority: resolvedPriority as Task['priority'],
      estimated_hours: hours,
      due_date: parsedDue,
    },
  };
}

export function validateTaskPatch(body: unknown):
  | { ok: true; data: TaskPatchInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  const allowed = ['title', 'priority', 'estimated_hours', 'due_date', 'is_completed'] as const;
  const raw = body as Record<string, unknown>;
  const keys = Object.keys(raw);

  if (keys.length === 0) {
    return { ok: false, error: 'No fields to update' };
  }

  for (const key of keys) {
    if (!allowed.includes(key as (typeof allowed)[number])) {
      return { ok: false, error: `Field "${key}" is not allowed` };
    }
  }

  const update: TaskPatchInput = {};

  if ('title' in raw) {
    if (!isNonEmptyString(raw.title, 500)) {
      return { ok: false, error: 'Title must be a non-empty string (max 500 characters)' };
    }
    update.title = raw.title.trim();
  }

  if ('priority' in raw) {
    if (
      typeof raw.priority !== 'string' ||
      !PRIORITIES.includes(raw.priority as Task['priority'])
    ) {
      return { ok: false, error: 'Priority must be Low, Medium, or High' };
    }
    update.priority = raw.priority as Task['priority'];
  }

  if ('estimated_hours' in raw) {
    const hours = Number(raw.estimated_hours);
    if (!Number.isInteger(hours) || hours < 1 || hours > 24) {
      return { ok: false, error: 'Estimated hours must be an integer between 1 and 24' };
    }
    update.estimated_hours = hours;
  }

  if ('due_date' in raw) {
    const parsedDue = parseDueDate(raw.due_date);
    if (!parsedDue) {
      return { ok: false, error: 'Due date must be YYYY-MM-DD' };
    }
    update.due_date = parsedDue;
  }

  if ('is_completed' in raw) {
    if (typeof raw.is_completed !== 'boolean') {
      return { ok: false, error: 'is_completed must be a boolean' };
    }
    update.is_completed = raw.is_completed;
  }

  return { ok: true, data: update };
}

export function validateFocusLogCreate(body: unknown):
  | { ok: true; data: FocusLogCreateInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }
  const { task_id, duration_seconds, session_type } = body as Record<string, unknown>;

  const duration = Number(duration_seconds);
  if (!Number.isInteger(duration) || duration < 1 || duration > 86400) {
    return { ok: false, error: 'duration_seconds must be an integer between 1 and 86400' };
  }

  if (typeof session_type !== 'string' || !SESSION_TYPES.includes(session_type as (typeof SESSION_TYPES)[number])) {
    return { ok: false, error: 'session_type must be Focus, Short Break, Long Break, or Task Done' };
  }

  let resolvedTaskId: string | null = null;
  if (task_id !== undefined && task_id !== null && task_id !== '') {
    if (typeof task_id !== 'string') {
      return { ok: false, error: 'task_id must be a string or null' };
    }
    resolvedTaskId = task_id;
  }

  return {
    ok: true,
    data: {
      task_id: resolvedTaskId,
      duration_seconds: duration,
      session_type,
    },
  };
}
