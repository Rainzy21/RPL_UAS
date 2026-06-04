"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/ui/TaskCard";

interface Props {
  onTasksChange: (tasks: Task[]) => void;
  onSelectTask: (id: string, title: string) => void;
  lockedTaskId: string | null;
}

type FilterTab = "All" | "Active" | "Completed";
const PRIORITIES: Task["priority"][] = ["Low", "Medium", "High"];

export default function TaskManagement({ onTasksChange, onSelectTask, lockedTaskId }: Props) {
  const { tasks, loading, error, clearError, fetchTasks, addTask, toggleTask, deleteTask } =
    useTasks();
  const [filter, setFilter] = useState<FilterTab>("All");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  useEffect(() => {
    onTasksChange(tasks);
  }, [tasks, onTasksChange]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setFormError("Fill in all fields");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await addTask(title.trim(), priority, estimatedHours, dueDate);
      setTitle("");
      setPriority("Medium");
      setEstimatedHours(1);
      setDueDate("");
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tasks.filter((t) =>
    filter === "All"
      ? true
      : filter === "Active"
        ? !t.is_completed
        : t.is_completed,
  );
  const counts = {
    All: tasks.length,
    Active: tasks.filter((t) => !t.is_completed).length,
    Completed: tasks.filter((t) => t.is_completed).length,
  };

  /* ── Shared input style ── */
  const fieldStyle: React.CSSProperties = {
    background: "#1c1c24",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h2 className="text-[15px] font-bold text-white">Task Management</h2>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            {counts.Active} active · {counts.Completed} done
          </p>
        </div>

        {/* + Add Task button — no purple outline, no wrapping */}
        <button
          id="add-task-btn"
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
          }}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: showForm
              ? "rgba(255,255,255,0.45)"
              : "rgba(255,255,255,0.75)",
            outline: "none",
          }}
          className="flex items-center gap-1.5 px-2 py-1.5 text-[12px] font-medium whitespace-nowrap hover:opacity-80 transition-opacity"
        >
          {showForm ? "×" : "+ Add Task"}
        </button>
      </div>

      {/* ── Slide-down form ── */}
      <div
        style={{
          maxHeight: showForm ? "260px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
          flexShrink: 0,
        }}
      >
        <form onSubmit={handleSubmit} className="mx-3 mb-3 space-y-3">
          {/* Task description */}
          <input
            id="task-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task description..."
            style={fieldStyle}
            className="w-full px-3 py-2.5 text-[13px] text-white/80 outline-none"
          />

          {/* Due date */}
          <div className="flex items-center gap-3">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.8"
              className="flex-shrink-0 ml-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div
              className="flex-1 flex items-center gap-2.5 px-3 py-2.5"
              style={fieldStyle}
            >
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                min={todayStr}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 bg-transparent text-[13px] outline-none [color-scheme:dark]"
                style={{
                  color: dueDate
                    ? "rgba(255,255,255,0.75)"
                    : "rgba(255,255,255,0.28)",
                }}
              />
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Priority + hours — one row */}
          <div className="flex items-center gap-2">
            {/* Priority (separated buttons) */}
            <div className="flex flex-1 gap-2 min-w-0">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  id={`priority-${p.toLowerCase()}`}
                  onClick={() => setPriority(p)}
                  style={{
                    background:
                      priority === p ? "rgba(255,255,255,0.12)" : "transparent",
                    color:
                      priority === p
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.32)",
                    border:
                      priority === p
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    outline: "none",
                  }}
                  className="flex-1 py-2 text-[10px] font-bold transition-all duration-150 hover:opacity-80"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Hours */}
            <div className="flex items-center gap-2">
              <svg
                width="13"
                height="13"
                fill="none"
                viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div
                className="flex items-center px-2.5 py-1.5"
                style={{
                  background: "#1c1c24",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                }}
              >
                <select
                  id="task-hours-select"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  style={{
                    background: "transparent",
                    color: "rgba(255,255,255,0.7)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  className="text-[12px] [color-scheme:dark] border-none pr-1"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option
                      key={n}
                      value={n}
                      className="bg-[#1c1c24] text-white"
                    >
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-[11px] px-0.5" style={{ color: "#f87171" }}>
              {formError}
            </p>
          )}

          {/* Submit */}
          <button
            id="task-submit-btn"
            type="submit"
            disabled={submitting}
            style={{
              background: "#2c2c36",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px",
              color: "rgba(255,255,255,0.78)",
              outline: "none",
            }}
            className="w-full py-2.5 text-[13px] font-medium disabled:opacity-40 hover:opacity-80 transition-opacity"
          >
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>

      {error && (
        <div
          className="mx-3 mb-2 px-3 py-2 rounded-lg text-[11px] flex items-center justify-between gap-2"
          style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-white/50 hover:text-white/80 shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-0.5 px-3 mb-1.5">
        {(["All", "Active", "Completed"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            id={`filter-${tab.toLowerCase()}`}
            type="button"
            onClick={() => setFilter(tab)}
            style={{ outline: "none" }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 ${
              filter === tab
                ? "bg-white/10 text-white/85"
                : "text-white/30 hover:text-white/55"
            }`}
          >
            {tab}
            {tab !== "All" ? (
              <span className="ml-1 opacity-60">({counts[tab]})</span>
            ) : (
              counts.All > 0 && (
                <span className="ml-1 opacity-50">({counts.All})</span>
              )
            )}
          </button>
        ))}
      </div>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 rounded-full border-2 border-t-violet-500 border-white/10 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p
              className="text-[12px]"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              No {filter.toLowerCase()} tasks
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((task) => (
              <div key={task.id} className="fade-in">
                  <TaskCard
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onClick={() => onSelectTask(task.id, task.title)}
                    isLocked={lockedTaskId === task.id}
                  />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
