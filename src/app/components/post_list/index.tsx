'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/app/components/post_card';
import type { PostWithUser, Post, User } from '@/types';
import styles from './styles.module.scss';

export default function PostList() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Criar uma query para posts, ordenados por createdAt (mais recentes primeiro)
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    // Configurar listener em tempo real para a coleção 'posts'
    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      setLoading(true);

      // Mapear os documentos para o formato Post
      const postsData = snapshot.docs.map((doc) => {
        const post = doc.data() as Post;

        // Converter createdAt (Timestamp ou FieldValue) para Date
        let convertedDate: Date;
        if (post.createdAt instanceof Timestamp) {
          convertedDate = post.createdAt.toDate();
        } else {
          // Fallback para FieldValue ou casos inesperados
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

      // Obter UIDs únicos dos autores
      const authorUIDs = Array.from(new Set(postsData.map((p) => p.authorUID)));

      // Buscar usuários correspondentes
      const usersQuery = query(collection(db, 'users'), where('uid', 'in', authorUIDs));
      const usersSnap = await getDocs(usersQuery);

      const usersMap: { [uid: string]: User } = {};
      usersSnap.docs.forEach((doc) => {
        usersMap[doc.id] = doc.data() as User;
      });

      // Combinar posts com informações dos usuários
      const postsWithUser: PostWithUser[] = postsData.map((post) => ({
        ...post,
        user: usersMap[post.authorUID] || undefined,
      }));

      setPosts(postsWithUser);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao ouvir posts:', error);
      setLoading(false);
    });

    // Limpar o listener quando o componente desmontar
    return () => unsubscribe();
  }, []);

  if (loading) return <p className={styles.loading}>Carregando posts...</p>;
  if (!posts.length) return <p className={styles.empty}>Nenhum post encontrado</p>;

  return (
    <section className={styles.grid}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}