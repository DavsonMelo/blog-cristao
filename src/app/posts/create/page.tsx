import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/firebase-admin-auth';
import CreatePostPageClient from './CreatePostPageClient';

// Interface para o user do Firebase Admin
interface AdminUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  [key: string]: any; // Para outras propriedades que possam existir
}

export default async function CreatePostPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/posts/create');
  }

  // Verificar se o session cookie é válido
  const user = await verifySessionCookie(sessionCookie) as AdminUser | null;

  if (!user) {
    // Cookie inválido ou expirado
    redirect('/login?redirect=/posts/create');
  }
 // Transforma para o formato esperado pelo client
  const userForClient = {
    uid: user.uid,
    email: user.email || '',
    email_verified: user.email_verified || false,
    name: user.name || '',
    picture: user.picture || ''
  };

  return <CreatePostPageClient user={userForClient} />;
}