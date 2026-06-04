'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: 'var(--bg-base)' }}
    >
      <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
      <p className="text-sm text-white/50 text-center max-w-md">
        An unexpected error occurred. You can try again or return to the dashboard.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
      >
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 text-xs text-red-400/80 max-w-lg overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
