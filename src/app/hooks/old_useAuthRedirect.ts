// hooks/useAuthRedirect.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function useAuthRedirect(redirectPath = '/login') {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`${redirectPath}?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, loading, router, redirectPath]);

  return user;
}