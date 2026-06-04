'use client';

interface Props {
  remaining: number;
  total: number;
  isRunning: boolean;
}

export default function TimerDisplay({ remaining, total, isRunning }: Props) {
  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const circumference = 2 * Math.PI * 90; // r=90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {/* SVG ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100" cy="100" r="90"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <circle
          cx="100" cy="100" r="90"
          fill="none"
          stroke="url(#timerGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Time text */}
      <div className="relative z-10 text-center">
        <span
          className="font-mono font-bold text-5xl tracking-widest text-white"
          style={{ textShadow: isRunning ? '0 0 20px rgba(139,92,246,0.6)' : 'none' }}
        >
          {mins}:{secs}
        </span>
        {isRunning && (
          <div className="mt-1 flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1 h-1 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
