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
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-sm text-white/50 mb-6 max-w-md">
        An unexpected error occurred. You can try again or return to the dashboard.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white/90 hover:bg-white/15 transition-colors"
      >
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-4 text-[11px] text-white/30 font-mono max-w-lg break-all">
          {error.message}
        </p>
      )}
    </div>
  );
}
