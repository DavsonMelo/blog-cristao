'use client';

import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p>Ops! A página que você está procurando não existe.</p>
      <Link href="/">Voltar para a Home</Link>
    </div>
  );
}
