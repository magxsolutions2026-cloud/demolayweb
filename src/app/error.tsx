'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CRITICAL APP ERROR:", error);
  }, [error]);

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ color: '#ff4444' }}>Something went wrong!</h2>
      <p style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '1rem' }}>
        <strong>Error Message:</strong> {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Digest: {error.digest}
        </p>
      )}
      <button
        onClick={() => reset()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}
