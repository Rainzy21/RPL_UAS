import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: 'var(--bg-base)' }}
    >
      <h1 className="text-lg font-semibold text-white">Page not found</h1>
      <p className="text-sm text-white/50">The page you requested does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
