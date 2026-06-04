'use client';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  accent?: string;
}

export default function MetricCard({ label, value, unit, icon, accent = 'text-violet-400' }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/8 p-4 flex items-center gap-3 group hover:bg-white/[0.07] transition-colors duration-200">
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      {/* Text */}
      <div className="min-w-0">
        <p className="text-xs text-white/45 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-white">
          {value}
          {unit && <span className="text-sm font-normal text-white/50 ml-1">{unit}</span>}
        </p>
      </div>
      {/* Decorative glow */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-500/5 rounded-full blur-xl" />
    </div>
  );
}
