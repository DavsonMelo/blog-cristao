'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import ThemeToggleButton from '@/app/components/theme_button/index';
import LoginButton from '@/app/components/login_button/index';
import styles from './styles.module.scss';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const handleLogout = async () => {
  try {
    // Logout client-side do Firebase
    await signOut(auth);

    // Limpa session cookie do server
    await fetch('/api/sessionLogout', { method: 'POST' });

    // Redireciona pra home ou login
    window.location.href = '/';
  } catch (err: any) {
    console.error('Erro ao deslogar:', err);
  }
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const timer = setTimeout(() => {
      setMenuOpen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [menuOpen]);

  const firstName = user?.displayName?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Usuário';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>❤️ Blog Cristão <span>❤️</span></div>
        <div className={styles.desktopNav}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/about" className={styles.link}>
            Sobre
          </Link>
        </div>
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <div className={styles.mobileNavLinks}>
            <Link href="/" className={styles.link} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/about" className={styles.link} onClick={() => setMenuOpen(false)}>
              Sobre
            </Link>
          </div>
          {user && (
            <div className={styles.userMenuContent}>
              {pathname === '/' && (
                <>
                  <button
                    className={styles.createPost}
                    onClick={() => {
                      localStorage.removeItem('draftPost');
                      router.push('/posts/create');
                      setMenuOpen(false);
                    }}
                  >
                    Criar post
                  </button>
                  <button
                    className={styles.editPost}
                    onClick={() => {
                      router.push('/posts/edit');
                      setMenuOpen(false);
                    }}
                  >
                    Editar posts
                  </button>
                </>
              )}
              <button className={styles.out} onClick={handleLogout}>
                Sair
              </button>
            </div>
          )}
        </nav>
        <div className={styles.userActions}>
          <ThemeToggleButton />
          {!user ? (
            <LoginButton />
          ) : (
            <div className={styles.userMenu}>
              <Image
                className={styles.avatar}
                src={user.photoURL || '/default-avatar.jpg'}
                alt="avatar"
                width={40}
                height={40}
                priority={true}
              />
              <span className={styles.username}>{firstName}</span>
            </div>
          )}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}