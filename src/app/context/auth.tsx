// context/auth.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase'; // seu config do firebase

interface AuthContextProps {
  user: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;

// Esse arquivo cria um contexto de autenticação no React para um aplicativo Next.js, usando o Firebase Authentication.
// 				Em resumo, ele faz três coisas principais:
// 				1. Gerencia o estado do usuário: Ele usa o useState para rastrear o usuário logado. A função onAuthStateChanged do Firebase ouve em tempo real as mudanças de login/logout e atualiza o estado user automaticamente.
// 				2. Fornece o contexto: Ele cria um AuthContext.Provider que disponibiliza o usuário atual (user) e uma função de logout para qualquer componente que precise desses dados.
// 				3. Oferece um hook customizado: O useAuth é um atalho que permite que qualquer componente dentro do <AuthProvider> acesse facilmente os dados do usuário e a função de logout, sem precisar passar propriedades manualmente.
// 				Em termos simples, este código é uma central de controle para o status de login de um usuário, tornando fácil saber se ele está autenticado e permitir que ele saia da conta, de forma segura e acessível em toda a sua aplicação.
