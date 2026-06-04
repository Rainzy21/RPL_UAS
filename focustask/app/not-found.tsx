import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-sm text-white/50 mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white/90 hover:bg-white/15 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
