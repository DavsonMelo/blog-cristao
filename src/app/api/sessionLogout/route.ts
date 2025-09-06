import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ status: 'success' });

  // Remove o session cookie
  res.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    path: '/',
  });

  return res;
}
