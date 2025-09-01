'use client';

import { useParams } from 'next/navigation';
import PostList from '@/app/components/post_list';
import styles from './styles.module.scss';

export default function AuthorPostsPage() {
  const { authorUID } = useParams();

  if (!authorUID || typeof authorUID !== 'string') {
    return <p className={styles.error}>Autor inválido</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Posts do Autor</h1>
      <PostList authorUID={authorUID} />
    </div>
  );
}