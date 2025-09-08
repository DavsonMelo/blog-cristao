import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';

interface NavItemProps {
  label: string;
  href?: string;          // se for link
  onClick?: () => void;   // se for ação
}

export default function NavItem({ label, href, onClick }: NavItemProps) {
  const router = useRouter();

  if (href) {
    // É um link real
    return (
      <Link href={href} className={styles.link}>
        {label}
      </Link>
    );
  }

  // É uma ação
  return (
    <button onClick={onClick} className={styles.link}>
      {label}
    </button>
  );
}
