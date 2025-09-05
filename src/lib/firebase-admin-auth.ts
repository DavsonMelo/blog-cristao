import { adminAuth } from './firebase-admin';

// Verificar se o usuário está autenticado via session cookie
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

// Verificação simples para páginas que requerem auth
export async function getCurrentUser() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) return null;
  
  return verifySessionCookie(sessionCookie);
}