'use client';

import { Task } from '@/types';

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG = {
  High:   { dot: 'bg-red-500',   text: 'text-red-400',   label: 'High' },
  Medium: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Medium' },
  Low:    { dot: 'bg-green-500', text: 'text-green-400', label: 'Low' },
};

function getDueBadge(dueDateStr: string, isCompleted: boolean) {
  if (isCompleted) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueDateStr + 'T00:00:00');

  if (due < today) {
    const days = Math.round((today.getTime() - due.getTime()) / 86400000);
    return { label: `${days}d overdue`, cls: 'border-red-500/40 text-red-400 bg-red-500/10' };
  }
  if (due.getTime() === today.getTime())
    return { label: 'Due today', cls: 'border-blue-500/40 text-blue-400 bg-blue-500/10' };
  if (due.getTime() === tomorrow.getTime())
    return { label: 'Due tomorrow', cls: 'border-blue-400/40 text-blue-300 bg-blue-400/10' };

  const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { label: formatted, cls: 'border-white/15 text-white/45 bg-white/5' };
}

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
  const dueBadge = getDueBadge(task.due_date, task.is_completed);

  return (
    <div className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-150 cursor-pointer
      ${task.is_completed ? 'opacity-50' : 'hover:bg-white/[0.04]'}`}
    >
      {/* Checkbox */}
      <button
        id={`check-${task.id}`}
        onClick={() => onToggle(task.id, !task.is_completed)}
        className={`mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all duration-150
          ${task.is_completed
            ? 'bg-violet-600 border-violet-600'
            : 'border-white/20 hover:border-violet-500/70'
          }`}
      >
        {task.is_completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium leading-snug mb-1.5
          ${task.is_completed ? 'line-through text-white/35' : 'text-white/85'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority */}
          <span className={`flex items-center gap-1 text-[11px] ${priority.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          {/* Estimated hours */}
          <span className="flex items-center gap-1 text-[11px] text-white/35">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {task.estimated_hours}p
          </span>
          {/* Due date badge */}
          {dueBadge && (
            <span className={`badge ${dueBadge.cls}`}>
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dueBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        id={`delete-${task.id}`}
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0 p-1 rounded text-white/25 hover:text-red-400 transition-all duration-150"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
