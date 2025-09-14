// blogfolio/src/app/components/header/HeaderClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; // <--- Usando o hook centralizado
import ThemeToggleButton from '@/app/components/theme_button/index';
import LoginButton from '@/app/components/login_button/index'; // Este botão deve lidar com a lógica do modal
import NavItem from '../nav_itens/NavItens';
import styles from './styles.module.scss';

// Propriedades que o componente cliente vai receber do servidor (se houver)
interface HeaderClientProps {
  greatVibesClassName: string;
}

export default function HeaderClient({
  greatVibesClassName,
}: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, userData, isLoading, logout } = useAuth(); // <--- Consumindo do AuthProvider

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
    if (!menuOpen) return;
    const timer = setTimeout(() => {
      setMenuOpen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [menuOpen]);

  // Renderiza o nome do usuário de forma mais flexível
  const displayName =
    user?.displayName || userData?.name || (user ? 'Usuário' : ''); // Se user existe mas não tem nome, mostra "Usuário"

  return (
    <>
      {/* Links desktop */}
      <div className={styles.desktopNav}>
        <NavItem label="Home" href="/" />
        <NavItem label="Sobre" href="/about" />
        {user && pathname === '/' && (
          <>
            <NavItem
              label="Criar post"
              onClick={() => {
                handlePrefetch();
                localStorage.removeItem('postDraft');
                router.push('/posts/create');
                setMenuOpen(false);
              }}
            />
          </>
        )}
        {/* Apenas exibe "Sair" se o usuário estiver logado */}
        {user && <NavItem label="Sair" onClick={logout} />}
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
                  handlePrefetch();
                  localStorage.removeItem('postDraft');
                  router.push('/posts/create');
                  setMenuOpen(false);
                }}
              />
            </>
          )}
          {user && <NavItem label="Sair" onClick={logout} />}
        </div>
      </nav>

      {/* User actions */}
      <div className={styles.userActions}>
        <ThemeToggleButton />
        {isLoading ? (
          // Placeholder enquanto carrega. Pode ser um ícone de carregamento ou algo similar.
          // O LoginButton também pode ter sua própria lógica de loading.
          <div className={styles.userMenu}>{/* Pode ser um spinner */}</div>
        ) : !user ? (
          // Se não houver usuário e não estiver carregando, mostra o botão de login
          <LoginButton />
        ) : (
          // Se houver usuário, mostra o avatar e o nome
          <div className={styles.userMenu}>
            <Image
              className={styles.avatar}
              src={
                user.photoURL ||
                userData?.profileImageUrl ||
                '/default-avatar.jpg'
              }
              alt="avatar"
              width={40}
              height={40}
              priority
            />
            <span className={styles.username}>{displayName}</span>
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
    </>
  );
}
