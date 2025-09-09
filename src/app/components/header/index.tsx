'use client';

import { Great_Vibes } from 'next/font/google';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import ThemeToggleButton from '@/app/components/theme_button/index';
import LoginButton from '@/app/components/login_button/index';
import styles from './styles.module.scss';
import { useRouter, usePathname } from 'next/navigation';
import NavItem from '../nav_itens/NavItens';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
});

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

  // Função que dispara o prefetch apenas uma vez
  const handlePrefetch = (() => {
    let prefetched = false;
    return () => {
      if (!prefetched) {
        router.prefetch('/posts/create');
        prefetched = true;
        if (process.env.NODE_ENV === 'development') {
          console.log('Prefetch /posts/create disparado!');
        }
      }
    };
  })();

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

  const firstName =
    user?.displayName?.split(' ')[0] ||
    userData?.name?.split(' ')[0] ||
    'Usuário';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <button
            className={`${styles.logoLink} ${greatVibes.className}`}
            onClick={() => {
              router.push('/');
              setMenuOpen(false);
            }}
          >
            ❤️ Blog Cristão <span>❤️</span>
          </button>
        </div>

        {/* Links desktop */}
        <div className={styles.desktopNav}>
          <NavItem label="Home" href="/" />
          <NavItem label="Sobre" href="/about" />
          {user && pathname === '/' && (
            <>
              <NavItem
                label="Criar post"
                onClick={() => {
                  handlePrefetch()
                  localStorage.removeItem('postDraft');
                  router.push('/posts/create');
                  setMenuOpen(false);
                }}
              />
              <NavItem
                label="Editar posts"
                onClick={() => {
                  router.push('/posts/edit');
                  setMenuOpen(false);
                }}
              />
            </>
          )}
          {user && <NavItem label="Sair" onClick={handleLogout} />}
        </div>

        {/* Mobile nav */}
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <div className={styles.mobileNavLinks}>
            <NavItem label="Home" href="/" onClick={() => setMenuOpen(false)} />
            <NavItem
              label="Sobre"
              href="/about"
              onClick={() => setMenuOpen(false)}
            />
            {user && pathname === '/' && (
              <>
                <NavItem
                  label="Criar post"
                  onClick={() => {
                    handlePrefetch()
                    localStorage.removeItem('postDraft');
                    router.push('/posts/create');
                    setMenuOpen(false);
                  }}
                />
                <NavItem
                  label="Editar posts"
                  onClick={() => {
                    router.push('/posts/edit');
                    setMenuOpen(false);
                  }}
                />
              </>
            )}
            {user && <NavItem label="Sair" onClick={handleLogout} />}
          </div>
        </nav>

        {/* User actions */}
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
                priority
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
