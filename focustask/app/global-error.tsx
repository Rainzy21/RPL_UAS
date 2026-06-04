'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d11',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
        <p style={{ fontSize: '0.875rem', opacity: 0.5, marginBottom: '1.5rem' }}>
          A critical error occurred. Please reload the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        {process.env.NODE_ENV === 'development' && (
          <pre
            style={{
              marginTop: '1rem',
              fontSize: '0.65rem',
              opacity: 0.35,
              maxWidth: '32rem',
              overflow: 'auto',
            }}
          >
            {error.message}
          </pre>
        )}
      </body>
    </html>
  );
}
