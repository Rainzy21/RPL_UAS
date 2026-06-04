'use client';

import { useState, useCallback } from 'react';
import { TimerMode } from '@/types';
import { useTimer } from '@/hooks/useTimer';

interface Props {
  lockedTaskTitle: string | null;
  sessionCount: number;
  onSessionComplete: (mode: TimerMode, taskId: string | null, taskTitle: string | null) => void;
}

const MODES: { label: TimerMode; icon: React.ReactNode; default: number }[] = [
  {
    label: 'Focus',
    default: 25,
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Short Break',
    default: 5,
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    label: 'Long Break',
    default: 15,
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      </svg>
    ),
  },
];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [880, 660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.15);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.15);
    });
  } catch { /* noop */ }
}

export default function FocusTimer({ lockedTaskTitle, sessionCount, onSessionComplete }: Props) {
  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = useCallback((mode: TimerMode, taskId: string | null, taskTitle: string | null) => {
    playBeep();
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 3000);
    onSessionComplete(mode, taskId, taskTitle);
  }, [onSessionComplete]);

  const { state, setMode, start, pause, reset, progress } = useTimer(handleComplete);

  const mins = Math.floor(state.remainingSeconds / 60).toString().padStart(2, '0');
  const secs = (state.remainingSeconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Focus Timer</h2>
          <p className="text-[11px] text-white/40 mt-0.5">{sessionCount} sessions completed today</p>
        </div>
        <div className="flex gap-1 mt-0.5">
          {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/20" />)}
        </div>
      </div>

      {/* Mode tabs */}
      <div className="mx-4 mb-5 grid grid-cols-3 border border-white/8 rounded-lg overflow-hidden">
        {MODES.map(m => (
          <button
            key={m.label}
            id={`mode-${m.label.toLowerCase().replace(' ', '-')}`}
            onClick={() => setMode(m.label)}
            className={`flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-all duration-150
              ${state.mode === m.label
                ? 'bg-white/10 text-white/90'
                : 'text-white/35 hover:text-white/55 hover:bg-white/[0.03]'
              }`}
          >
            <span className={state.mode === m.label ? 'text-violet-400' : 'text-white/30'}>
              {m.icon}
            </span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer circle — centered, grows with available space */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        {/* Circle */}
        <div className="timer-circle">
          {/* Thin progress arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="107" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            {progress > 0 && (
              <circle
                cx="110" cy="110" r="107"
                fill="none"
                stroke="rgba(124,58,237,0.6)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 107}
                strokeDashoffset={2 * Math.PI * 107 * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            )}
          </svg>

          {/* Time */}
          <span
            className="font-mono font-bold text-[52px] tracking-widest text-white leading-none"
            style={{ textShadow: state.isRunning ? '0 0 24px rgba(139,92,246,0.35)' : 'none' }}
          >
            {mins}:{secs}
          </span>
          <span className="text-[10px] font-medium tracking-[0.15em] text-white/30 uppercase mt-1.5">
            {state.mode}
          </span>
        </div>

        {/* Locked task */}
        {lockedTaskTitle && (
          <p className="text-[11px] text-violet-400/80 text-center px-4">
            Working on: <span className="text-violet-300">{lockedTaskTitle}</span>
          </p>
        )}

        {/* Completion flash */}
        {justCompleted && (
          <div className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-lg">
            <p className="text-[12px] text-emerald-400 font-medium text-center">✓ Session complete!</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-5">
          {/* Reset */}
          <button
            id="timer-reset-btn"
            onClick={reset}
            className="w-10 h-10 rounded-full border border-white/12 bg-white/[0.04] text-white/45 hover:text-white/70 hover:bg-white/[0.08] flex items-center justify-center transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            id="timer-play-pause-btn"
            onClick={state.isRunning ? pause : start}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
              ${state.isRunning
                ? 'bg-white/10 border border-white/15 text-white/60 hover:bg-white/15'
                : 'bg-white/10 border border-white/15 text-white/80 hover:bg-white/[0.15]'
              }`}
          >
            {state.isRunning ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-4 mt-4">
        <div className="flex justify-between text-[11px] text-white/30 mb-1.5">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500/70 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
