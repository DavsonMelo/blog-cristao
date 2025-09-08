// app/login/page.tsx
'use client';

import AuthModal from '@/app/components/auth_modal';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/"); // ou router.push('/') para ir para home
  };

  return <AuthModal redirect="posts/create" onClose={handleClose} />;
}
