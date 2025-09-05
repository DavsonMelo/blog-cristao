'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function usePrefetch(url: string, condition: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (condition && url) {
      router.prefetch(url);
      console.log(`Página pré-carregada: ${url}`);
    }
  }, [url, condition, router]);
}

// Versão avançada com múltiplas URLs
export function usePrefetchMultiple(urls: string[], condition: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (condition && urls.length > 0) {
      urls.forEach(url => {
        router.prefetch(url);
      });
      console.log(`${urls.length} páginas pré-carregadas`);
    }
  }, [urls, condition, router]);
}