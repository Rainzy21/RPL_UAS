'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimerMode } from '@/types';

const LS_KEY = 'focustask_timer_state';

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  'Focus': 30 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60,
};

function loadState(): TimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: TimerState & { savedAt: number } = JSON.parse(raw);
    // Adjust remaining seconds if timer was running when page closed
    if (parsed.isRunning && parsed.savedAt) {
      const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000);
      parsed.remainingSeconds = Math.max(0, parsed.remainingSeconds - elapsed);
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: TimerState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
}

export function useTimer(onComplete: (mode: TimerMode, taskId: string | null, taskTitle: string | null, durationSeconds: number) => void) {
  const [state, setState] = useState<TimerState>(() => {
    const saved = loadState();
    if (saved) return saved;
    return {
      mode: 'Focus',
      totalSeconds: DEFAULT_DURATIONS['Focus'],
      remainingSeconds: DEFAULT_DURATIONS['Focus'],
      isRunning: false,
      lockedTaskId: null,
      lockedTaskTitle: null,
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Persist state to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(intervalRef.current!);
            onCompleteRef.current(prev.mode, prev.lockedTaskId, prev.lockedTaskTitle, prev.totalSeconds);
            return { ...prev, remainingSeconds: 0, isRunning: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning]);

  const setMode = useCallback((mode: TimerMode, customSeconds?: number) => {
    const secs = customSeconds ?? DEFAULT_DURATIONS[mode];
    setState(prev => ({
      ...prev,
      mode,
      totalSeconds: secs,
      remainingSeconds: secs,
      isRunning: false,
    }));
  }, []);

  const setCustomDuration = useCallback((minutes: number) => {
    const secs = minutes * 60;
    setState(prev => ({
      ...prev,
      totalSeconds: secs,
      remainingSeconds: secs,
      isRunning: false,
    }));
  }, []);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);
  const reset = useCallback(() =>
    setState(prev => ({
      ...prev,
      remainingSeconds: prev.totalSeconds,
      isRunning: false,
    })), []);

  const lockTask = useCallback((taskId: string | null, taskTitle: string | null) => {
    setState(prev => ({ ...prev, lockedTaskId: taskId, lockedTaskTitle: taskTitle }));
  }, []);

  const progress = state.totalSeconds > 0
    ? ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100
    : 0;

  return { state, setMode, setCustomDuration, start, pause, reset, lockTask, progress };
}
