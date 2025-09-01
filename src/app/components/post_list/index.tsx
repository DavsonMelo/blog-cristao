'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where, getDocs, Timestamp, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/app/components/post_card';
import type { PostWithUser, Post, User } from '@/types';
import styles from './styles.module.scss';

interface PostListProps {
  authorUID?: string;
}

export default function PostList({ authorUID }: PostListProps = {}) {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Criar array de constraints com tipo correto
    const constraints: QueryConstraint[] = [];
    if (authorUID) {
      constraints.push(where('authorUID', '==', authorUID));
    }
    constraints.push(orderBy('createdAt', 'desc'));

    // Criar query com constraints
    const postsQuery = query(collection(db, 'posts'), ...constraints);

    // Configurar listener em tempo real
    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      setLoading(true);
      const postsData = snapshot.docs.map((doc) => {
        const post = doc.data() as Post;
        let convertedDate: Date;
        if (post.createdAt instanceof Timestamp) {
          convertedDate = post.createdAt.toDate();
        } else {
          console.warn(`createdAt inválido no post ${doc.id}:`, post.createdAt);
          convertedDate = new Date();
        }
        return {
          id: doc.id,
          ...post,
          createdAt: convertedDate,
        };
      });

      if (postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Buscar usuários correspondentes
      const authorUIDs = Array.from(new Set(postsData.map((p) => p.authorUID)));
      const usersQuery = query(collection(db, 'users'), where('uid', 'in', authorUIDs));
      const usersSnap = await getDocs(usersQuery);
      const usersMap: { [uid: string]: User } = {};
      usersSnap.docs.forEach((doc) => {
        usersMap[doc.id] = doc.data() as User;
      });

      const postsWithUser: PostWithUser[] = postsData.map((post) => ({
        ...post,
        user: usersMap[post.authorUID] || undefined,
      }));

      setPosts(postsWithUser);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authorUID]);

  if (loading) return <p className={styles.loading}>Carregando posts...</p>;
  if (!posts.length) return (
    <p className={styles.empty}>
      {authorUID ? 'Nenhum post encontrado para este autor' : 'Nenhum post encontrado'}
    </p>
  );

  return (
    <section className={styles.grid}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}