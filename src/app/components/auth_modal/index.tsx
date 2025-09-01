'use client';

// lib externas
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from 'firebase/auth';
import { serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { X } from 'lucide-react';
import { getDoc } from 'firebase/firestore';


// libs e codigos proprios
import { auth, db } from '@/lib/firebase';
import styles from './styles.module.scss';
import { User } from '@/types';


interface AuthModalProps {
  onClose: () => void;
}

// ➡️ Nova função para salvar o perfil do usuário
const saveUserProfile = async (userAuth: any) => {
  if (!userAuth) return;

  const userRef = doc(db, 'users', userAuth.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const userProfile: User = {
      uid: userAuth.uid,
      name: userAuth.displayName || 'Usuário',
      email: userAuth.email || '',
      profileImageUrl: userAuth.photoURL || undefined,
    };
    await setDoc(userRef, userProfile);
  } else {
    // ➡️ Atualiza o perfil caso já exista (usado para Google/GitHub)
    await setDoc(userRef, {
      name: userAuth.displayName || 'Usuário',
      email: userAuth.email,
      profileImageUrl: userAuth.photoURL || undefined,
    }, { merge: true });
  }
};


export default function AuthModal({ onClose }: AuthModalProps) {
  const [view, setView] = useState('default'); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Salva os dados do novo usuário no Firestore após o cadastro
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      });
      onClose(); 
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ➡️ Login com sucesso
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // ➡️ O erro estava aqui! Não salvava o perfil do usuário no login
      await saveUserProfile(userCred.user);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer login: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUserProfile(result.user);
      onClose();
    } catch(err: any) {
      console.error(err);
      alert('Erro ao fazer login com Google: ' + err.message);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider)
      await saveUserProfile(result.user);
      onClose();
    } catch(err: any) {
      console.error(err);
      alert('Erro ao fazer login com GitHub: ' + err.message);
    }
  };


  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          <X />
        </button>

        {view === 'default' ? (
          <>
            <h2 className={styles.modalTitle}>Inscreva-se</h2>
            <button className={styles.provider} onClick={handleGoogleLogin}>Com Google</button>
            <button className={styles.provider} onClick={handleGitHubLogin}>Com GitHub</button>
            <button
              className={styles.createAccount} onClick={() => setView('createAccount')}>
                Criar Conta
            </button>
            <p>
              Já tem uma conta?
              <button className={styles.switch} onClick={() => setView('login')}>
                Entrar
              </button>
            </p>
          </>
        ) : view === 'createAccount' ? (
          <>
            <h2>Criar Conta</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Repetir senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
               <button type="submit">Criar Conta</button>
            </form>
            <button onClick={() => setView('default')}>Voltar</button>
          </>
        ) : (
          <>
            <h2>Entrar</h2>
            <form className={styles.form} onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Entrar</button>
            </form>
            <button onClick={() => setView('default')}>Voltar</button>
          </>
        )}
      </div>
    </div>
  );
}
