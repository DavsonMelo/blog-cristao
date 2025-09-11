// blogfolio/src/app/context/auth.tsx (Ajustado)

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback, // Importar useCallback
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
import { useRouter } from 'next/navigation'; // Importar useRouter para redirecionamento no modal

interface AuthContextProps {
  user: User | null;
  userData: UserProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, name: string) => Promise<void>;
  // Adicionar função para fechar o modal (se necessário para o AuthModal)
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Estado para controlar o modal
  const auth = getAuth(app);
  const router = useRouter(); // Para redirecionamentos

  const saveUserProfileAndCreateSession = useCallback(async (userAuth: User) => {
    const userRef = doc(db, 'users', userAuth.uid);
    const userDoc = await getDoc(userRef);
    const profile: UserProfile = {
      uid: userAuth.uid,
      name: userAuth.displayName || 'Usuário',
      email: userAuth.email || '',
      profileImageUrl: userAuth.photoURL || undefined,
    };
    if (!userDoc.exists()) {
      await setDoc(userRef, profile);
    } else {
      await setDoc(userRef, profile, { merge: true });
    }
    setUserData(profile);
    const idToken = await userAuth.getIdToken(true);
    await fetch('/api/sessionLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  }, []); // useCallback para evitar recriação da função

  useEffect(() => {
    // 1. Tenta obter o resultado do redirect PRIMEIRO
    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // Se o login por redirect foi bem-sucedido
          await saveUserProfileAndCreateSession(result.user);
          setUser(result.user);
          // O redirect pode ter vindo de um login, então fechamos o modal se estiver aberto
          setIsAuthModalOpen(false);
          // Opcional: redirecionar para a página original ou home
          // router.push('/'); 
        }
      } catch (error) {
        console.error('Erro no resultado do redirect:', error);
        // Tratar erro de redirect aqui (ex: mostrar um alert)
      } finally {
        setIsLoading(false); // Finaliza o loading após tentar o redirect
      }
    };

    // 2. Em seguida, escuta as mudanças de estado do usuário (para casos de login já existente ou logout)
    const unsubscribeAuthState = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await saveUserProfileAndCreateSession(currentUser);
      } else {
        // Se não há usuário logado E o redirect não trouxe um, limpamos os dados
        if (!isLoading) { // Evita limpar se o redirect ainda está processando
            setUser(null);
            setUserData(null);
        }
      }
      // Se o loading ainda está ativo, significa que o redirect terminou ou não houve redirect.
      if (isLoading) setIsLoading(false);
    });

    // Chamamos processRedirect para tentar capturar o resultado do redirect
    processRedirect(); 
    
    return () => {
        unsubscribeAuthState(); // Limpa o listener do onAuthStateChanged
    };
  }, [auth, saveUserProfileAndCreateSession, isLoading, router]); // Adicionado isLoading e router nas dependências

  // Funções de login
  const loginWithGoogle = async () => {
    setIsAuthModalOpen(true); // Abre o modal primeiro
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
      // O redirect vai mudar a página. A lógica de processamento está no useEffect.
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      // Aqui é onde podemos ter um feedback visual para o usuário
      alert('Ocorreu um erro ao iniciar o login com Google.'); 
      setIsLoading(false); // Garante que o loading pare em caso de erro imediato
      // throw error; // Não lançamos erro aqui pois o redirect cuida do processamento
    }
  };
  
  const loginWithGithub = async () => {
    setIsAuthModalOpen(true);
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
      // Usamos signInWithEmailAndPassword, que é síncrono
      await signInWithEmailAndPassword(auth, email, password);
      // A lógica de salvar perfil e sessão será tratada pelo onAuthStateChanged no useEffect
      setIsAuthModalOpen(false); // Fecha o modal após login bem-sucedido com email
    } catch (error) {
      console.error('Erro ao logar com Email:', error);
      throw error; // Lançamos o erro para o AuthModal lidar
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged no useEffect vai pegar o novo usuário e salvar o perfil
      // Precisamos garantir que o saveUserProfileAndCreateSession seja chamado com o novo usuário
      await saveUserProfileAndCreateSession(userCred.user);
      setIsAuthModalOpen(false); // Fecha o modal após criar conta e logar
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error; // Lançamos o erro para o AuthModal lidar
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      await fetch('/api/sessionLogout', { method: 'POST' });
      setUser(null); // Limpa o estado local
      setUserData(null);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAuthModal = () => {
      setIsAuthModalOpen(false);
      // Opcional: Se o modal for fechado manualmente, você pode querer redirecionar
      // router.push('/'); 
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
    closeAuthModal, // Fornece a função para fechar o modal
    isAuthModalOpen, // Fornece o estado do modal
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