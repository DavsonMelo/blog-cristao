import { Great_Vibes } from 'next/font/google';
import HeaderClient from './HeaderClient';
import styles from './styles.module.scss';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
});

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo (Server Component) */}
        <div className={styles.logo}>
          <a href="/" className={`${styles.logoLink} ${greatVibes.className}`}>
            ❤️ Blog Cristão <span>❤️</span>
          </a>
        </div>

        {/* Componente Cliente para a parte interativa */}
        <HeaderClient greatVibesClassName={greatVibes.className} />
      </div>
    </header>
  );
}