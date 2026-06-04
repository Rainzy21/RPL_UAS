import { z } from 'zod';

const PRIORITIES = ['Low', 'Medium', 'High'] as const;
const SESSION_TYPES = ['Focus', 'Short Break', 'Long Break', 'Task Done'] as const;

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be YYYY-MM-DD');

function isValidCalendarDate(value: string): boolean {
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return (
    parsed.getFullYear() === y &&
    parsed.getMonth() === m - 1 &&
    parsed.getDate() === d
  );
}

function isNotPastDate(value: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = value.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  return due >= today;
}

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(500),
    priority: z.enum(PRIORITIES).optional().default('Medium'),
    estimated_hours: z.coerce.number().int().min(1).max(24).optional().default(1),
    due_date: dateString,
  })
  .superRefine((data, ctx) => {
    if (!isValidCalendarDate(data.due_date)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid due date', path: ['due_date'] });
      return;
    }
    if (!isNotPastDate(data.due_date)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Due date cannot be in the past',
        path: ['due_date'],
      });
    }
  });

export const patchTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(500).optional(),
    priority: z.enum(PRIORITIES).optional(),
    estimated_hours: z.coerce.number().int().min(1).max(24).optional(),
    due_date: dateString.optional(),
    is_completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
  .superRefine((data, ctx) => {
    if (data.due_date !== undefined) {
      if (!isValidCalendarDate(data.due_date)) {
        ctx.addIssue({ code: 'custom', message: 'Invalid due date', path: ['due_date'] });
      } else if (!isNotPastDate(data.due_date)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Due date cannot be in the past',
          path: ['due_date'],
        });
      }
    }
  });

export const createFocusLogSchema = z
  .object({
    task_id: z.string().uuid().nullable().optional(),
    duration_seconds: z.coerce.number().int(),
    session_type: z.enum(SESSION_TYPES),
  })
  .superRefine((data, ctx) => {
    if (data.session_type === 'Task Done') {
      if (data.duration_seconds !== 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Task Done events must have duration_seconds of 0',
          path: ['duration_seconds'],
        });
      }
      if (!data.task_id) {
        ctx.addIssue({
          code: 'custom',
          message: 'task_id is required for Task Done',
          path: ['task_id'],
        });
      }
      return;
    }
    if (data.duration_seconds <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'duration_seconds must be greater than 0',
        path: ['duration_seconds'],
      });
    }
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type PatchTaskInput = z.infer<typeof patchTaskSchema>;
export type CreateFocusLogInput = z.infer<typeof createFocusLogSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request';
}
