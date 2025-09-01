'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export function useAuthRedirect() {
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push('/'); // redireciona se não logado
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return user;
}

/*
Hook utilizado em:
app/posts/create/page.tsx

Verifica se existe um usuario logado, e caso nao tenha, ou usuario deslogue, retorna a home
*/