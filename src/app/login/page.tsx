// app/login/page.tsx
'use client';

import AuthModal from '@/app/components/auth_modal';

export default function LoginPage() {
  // Define pra onde redirecionar após login/cadastro
  const redirectTo = '/posts/create'; // ou qualquer outra página padrão

  return <AuthModal redirect={redirectTo} />;
}
