'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Algo deu errado!</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Tentar novamente</button>
    </div>
  );
}
