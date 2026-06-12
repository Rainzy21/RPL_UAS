'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimerMode } from '@/types';

const LS_KEY = 'focustask_timer_state_v2';

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  'Focus': 1 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60,
};

type SavedTimerState = TimerState & { savedAt?: number };

type LoadResult = {
  state: TimerState;
  completeOnMount: boolean;
};

function loadState(): LoadResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: SavedTimerState = JSON.parse(raw);
    let completeOnMount = false;

    if (parsed.isRunning && parsed.savedAt) {
      const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000);
      parsed.remainingSeconds = Math.max(0, parsed.remainingSeconds - elapsed);
      if (parsed.remainingSeconds === 0) {
        parsed.isRunning = false;
        completeOnMount = true;
      }
    }

    const state: TimerState = {
      mode: parsed.mode,
      totalSeconds: parsed.totalSeconds,
      remainingSeconds: parsed.remainingSeconds,
      isRunning: parsed.isRunning,
      lockedTaskId: parsed.lockedTaskId,
      lockedTaskTitle: parsed.lockedTaskTitle,
    };
    return { state, completeOnMount };
  } catch {
    return null;
  }
}

function saveState(state: TimerState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
}

const defaultState: TimerState = {
  mode: 'Focus',
  totalSeconds: DEFAULT_DURATIONS['Focus'],
  remainingSeconds: DEFAULT_DURATIONS['Focus'],
  isRunning: false,
  lockedTaskId: null,
  lockedTaskTitle: null,
};

export function useTimer(onComplete: (mode: TimerMode, taskId: string | null, taskTitle: string | null, durationSeconds: number) => void) {
  const [initial] = useState(() => {
    const loaded = loadState();
    return {
      state: loaded?.state ?? defaultState,
      completeOnMount: loaded?.completeOnMount ?? false,
    };
  });

  const [state, setState] = useState<TimerState>(initial.state);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!initial.completeOnMount) return;
    onCompleteRef.current(
      initial.state.mode,
      initial.state.lockedTaskId,
      initial.state.lockedTaskTitle,
      initial.state.totalSeconds,
    );
  }, [initial]);

  useEffect(() => {
    saveState(state);
  }, [state]);

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

  const setMode = useCallback((mode: TimerMode) => {
    const secs = DEFAULT_DURATIONS[mode];
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

  const progress = state.totalSeconds > 0
    ? ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100
    : 0;

  return { state, setMode, setCustomDuration, start, pause, reset, progress };
}
