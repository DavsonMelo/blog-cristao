'use client';
// libs externas
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
// libs e codigos proprios
import { auth, db } from '@/lib/firebase';
import ThemeToggleButton from '@/app/components/theme_button/index';
import LoginButton from '@/app/components/login_button/index';
import styles from './styles.module.scss';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false); // Controla o menu hamburger
  const [user, setUser] = useState<User | null>(null); // controla sessão de usuario
  const [userData, setUserData] = useState<any>(null); // Busca dado no bd firebase
  const router = useRouter()
  const pathname = usePathname()


  // UseEfect para checar usuario logado
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

  // Auto-close 3s depois de abrir
  useEffect(() => {
    if (!menuOpen) return;
    const timer = setTimeout(() => {
      setMenuOpen(false);
    }, 5000); // 5000ms = 5 segundos

    return () => clearTimeout(timer); // limpa se fechar antes
  }, [menuOpen]);

  const firstName =
    user?.displayName?.split(' ')[0] ||
    userData?.name?.split(' ')[0] ||
    'Usuário';

  // Bloco que retorna o HTML
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>❤️ Blog Cristão ❤️</div>
        {/* dentro da nav class nav/+open -> HOME, SOBRE, CRIAR POST, SAIR */}
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <Link href="/" className={styles.link} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/about" className={styles.link}>Sobre</Link>

          {user && (
            <div className={styles.userMenu}>
              <div className={styles.userMenuContent}>
               {pathname === '/' && (
                 <button 
                className={styles.createPost}
                onClick={() => {
                  localStorage.removeItem('draftPost');
                  router.push('/posts/create');
                }}
                >
                  Criar post
                  </button>
               )}
                <button className={styles.out} onClick={() => signOut(auth)}>Sair</button>
              </div>
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
          {/* Hamburger */}
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

// Este código cria o componente de cabeçalho (Header) para um site Next.js. Ele é um componente complexo que lida com a interface do usuário, a autenticação do usuário e a obtenção de dados do Firestore.

// Funcionalidades Principais
// Gerenciamento de Estado: Usa useState para controlar o estado do menu (aberto ou fechado), o objeto do usuário logado (user) e os dados adicionais do usuário armazenados no Firestore (userData).

// Autenticação de Usuário: O primeiro useEffect monitora o estado de autenticação do Firebase. Se um usuário estiver logado (currentUser), ele busca os dados do usuário do banco de dados Firestore ('users') usando o uid (ID do usuário). Isso permite exibir o nome ou avatar do usuário.

// Menu Responsivo e Fechamento Automático: O segundo useEffect controla o comportamento do menu hambúrguer. Se o menu estiver aberto, ele usa um setTimeout para fechá-lo automaticamente após 5 segundos, melhorando a usabilidade.

// Componentes e Lógica de Renderização:

// O componente renderiza uma barra de navegação com links e um logotipo.

// Ele exibe um botão de "Sair" apenas se o usuário estiver logado.

// Ele usa renderização condicional para mostrar o LoginButton se o usuário não estiver logado, ou o nome e avatar do usuário se estiver autenticado.

// Um ThemeToggleButton (provavelmente importado de outro lugar) é exibido para alternar entre temas claro/escuro.

// Estilização: O componente importa estilos específicos de um arquivo styles.module.scss, garantindo que o CSS seja modular e não entre em conflito com outras partes da aplicação.
