// blogfolio/src/app/context/auth.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { User as UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  user: User | null;
  userData: UserProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, name: string) => Promise<void>;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();

  const saveUserProfileAndCreateSession = useCallback(async (userAuth: User) => {
    try {
      const userRef = doc(db, 'users', userAuth.uid);
      const userDoc = await getDoc(userRef);
      const profile: UserProfile = {
        uid: userAuth.uid,
        name: userAuth.displayName || 'Usuário',
        email: userAuth.email || '',
        profileImageUrl: userAuth.photoURL || undefined,
      };
      // Usar a opção 'merge: true' sempre é uma boa prática
      await setDoc(userRef, profile, { merge: true });
      setUserData(profile);
      const idToken = await userAuth.getIdToken(true);
      await fetch('/api/sessionLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error('Erro ao salvar perfil ou criar sessão:', error);
      // Você pode adicionar uma notificação ao usuário aqui
      throw error; // Lança o erro para que o onAuthStateChanged saiba que algo falhou
    }
  }, []);

  useEffect(() => {
    // Escuta as mudanças de estado de autenticação
    const unsubscribeAuthState = onAuthStateChanged(auth, async (currentUser) => {
      // Se houver um usuário logado
      if (currentUser) {
        // Apenas atualiza o estado local e dispara a função se for um novo login ou uma atualização de estado
        setUser(currentUser);
        await saveUserProfileAndCreateSession(currentUser);
      } else {
        // Se o usuário deslogou ou não há um usuário
        // O erro de permissão é evitado porque saveUserProfileAndCreateSession não é chamado aqui
        setUser(null);
        setUserData(null);
        await fetch('/api/sessionLogout', { method: 'POST' }); // Garante o logout no servidor
      }
      setIsLoading(false); // Sempre para o loading após verificar o estado inicial
    });

    // Limpeza do listener ao desmontar o componente
    return () => unsubscribeAuthState();
  }, [auth, saveUserProfileAndCreateSession]);

  // Função para lidar com o redirect, separada do useEffect para maior clareza
  const handleRedirectResult = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        // Se o login por redirect foi bem-sucedido, o onAuthStateChanged vai lidar com o resto.
        // Apenas fechamos o modal e redirecionamos, se necessário.
        setIsAuthModalOpen(false);
        // Opcional: router.push('/');
      }
    } catch (error) {
      console.error('Erro no resultado do redirect:', error);
      alert('Ocorreu um erro no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [auth, router]);

  useEffect(() => {
    // Chamada inicial para verificar o resultado de um redirect
    handleRedirectResult();
  }, [handleRedirectResult]);

  // Funções de login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      alert('Ocorreu um erro ao iniciar o login com Google.');
      setIsLoading(false);
    }
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, new GithubAuthProvider());
    } catch (error) {
      console.error('Erro ao iniciar login com GitHub:', error);
      alert('Ocorreu um erro ao iniciar o login com GitHub.');
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Erro ao logar com Email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged vai capturar a mudança de estado e salvar o perfil,
      // não é necessário chamar a função aqui
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // O onAuthStateChanged vai limpar os estados de usuário e fazer o logout na API,
      // simplificando o código aqui
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    userData,
    isLoading,
    logout,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    createAccount,
    closeAuthModal,
    isAuthModalOpen,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};