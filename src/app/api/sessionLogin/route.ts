import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin'; // usando seu export existente

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token não enviado' }, { status: 400 });
    }

    // Expiração do cookie: 5 dias
    const expiresIn = 5 * 24 * 60 * 60 * 1000;

    // Cria o session cookie usando o adminAuth
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ status: 'success' });

    res.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Erro criando session cookie:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
