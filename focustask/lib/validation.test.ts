import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskSchema,
  createFocusLogSchema,
  patchTaskSchema,
} from './validation.ts';

describe('createTaskSchema', () => {
  it('rejects empty title', () => {
    const result = createTaskSchema.safeParse({
      title: '   ',
      due_date: '2099-01-01',
    });
    assert.equal(result.success, false);
  });

  it('rejects invalid due_date format', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      due_date: 'not-a-date',
    });
    assert.equal(result.success, false);
  });

  it('rejects past due_date', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      due_date: '2000-01-01',
    });
    assert.equal(result.success, false);
  });

  it('accepts valid task', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const due = tomorrow.toISOString().slice(0, 10);
    const result = createTaskSchema.safeParse({
      title: 'Write docs',
      due_date: due,
    });
    assert.equal(result.success, true);
  });
});

describe('patchTaskSchema', () => {
  it('rejects empty patch', () => {
    const result = patchTaskSchema.safeParse({});
    assert.equal(result.success, false);
  });

  it('allows is_completed only', () => {
    const result = patchTaskSchema.safeParse({ is_completed: true });
    assert.equal(result.success, true);
  });
});

describe('createFocusLogSchema', () => {
  it('requires positive duration for Focus sessions', () => {
    const result = createFocusLogSchema.safeParse({
      duration_seconds: 0,
      session_type: 'Focus',
    });
    assert.equal(result.success, false);
  });

  it('allows zero duration for Task Done with task_id', () => {
    const result = createFocusLogSchema.safeParse({
      task_id: '550e8400-e29b-41d4-a716-446655440000',
      duration_seconds: 0,
      session_type: 'Task Done',
    });
    assert.equal(result.success, true);
  });
});
