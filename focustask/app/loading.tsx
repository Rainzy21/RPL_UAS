export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-violet-500 border-white/10 animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
