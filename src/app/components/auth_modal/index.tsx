'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.scss';
import { X } from 'lucide-react';
import { User } from '@/types';

export default function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [view, setView] = useState<'default' | 'createAccount' | 'login'>('default');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Salva/atualiza perfil no Firestore
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
      await setDoc(
        userRef,
        {
          name: userAuth.displayName || 'Usuário',
          email: userAuth.email,
          profileImageUrl: userAuth.photoURL || undefined,
        },
        { merge: true }
      );
    }
  };

  // Cria session cookie via API
  const createSessionCookie = async () => {
    if (!auth.currentUser) return;

    const idToken = await auth.currentUser.getIdToken(true);
    await fetch('/api/sessionLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  };

  const handleRedirect = () => {
    router.push(redirectTo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Salva perfil no Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      });

      await createSessionCookie(); // ✅ cria cookie para server-side
      await saveUserProfile(userCred.user);

      handleRedirect(); // vai para a página desejada
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      await createSessionCookie();
      await saveUserProfile(userCred.user);

      handleRedirect();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer login: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await createSessionCookie();
      await saveUserProfile(result.user);

      handleRedirect();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer login com Google: ' + err.message);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await createSessionCookie();
      await saveUserProfile(result.user);

      handleRedirect();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer login com GitHub: ' + err.message);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={handleRedirect}>
          <X />
        </button>

        {view === 'default' ? (
          <>
            <h2 className={styles.modalTitle}>Inscreva-se</h2>
            <button className={styles.provider} onClick={handleGoogleLogin}>Com Google</button>
            <button className={styles.provider} onClick={handleGitHubLogin}>Com GitHub</button>
            <button className={styles.createAccount} onClick={() => setView('createAccount')}>Criar Conta</button>
            <p>
              Já tem uma conta?
              <button className={styles.switch} onClick={() => setView('login')}>Entrar</button>
            </p>
          </>
        ) : view === 'createAccount' ? (
          <>
            <h2>Criar Conta</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input type="password" placeholder="Repetir senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="submit">Criar Conta</button>
            </form>
            <button onClick={() => setView('default')}>Voltar</button>
          </>
        ) : (
          <>
            <h2>Entrar</h2>
            <form className={styles.form} onSubmit={handleLogin}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit">Entrar</button>
            </form>
            <button onClick={() => setView('default')}>Voltar</button>
          </>
        )}
      </div>
    </div>
  );
}
