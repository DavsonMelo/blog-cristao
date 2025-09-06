'use client'

import PostList from '@/app/components/post_list';
import { usePosts } from '../hooks/usePosts';
import styles from './page.module.scss';


export default function Home() {
  const { posts, loading, error } = usePosts();

  if(error) {
    return <div className={styles.main}><p>Erro ao carregar posts: { error }</p></div>
  }

  return (
    <div className={styles.main}>
      <PostList />
    </div>
  );
}
