'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  limit,
  startAfter,
} from 'firebase/firestore';
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
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const PAGE_SIZE = 10;

  const convertCreatedAt = (createdAt: any): string => {
    if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
      return (createdAt as Timestamp).toDate().toISOString();
    } else if (typeof createdAt === 'string') {
      return createdAt;
    } else {
      console.warn('createdAt inválido:', createdAt);
      return new Date().toISOString();
    }
  };

  useEffect(() => {
    const constraints: QueryConstraint[] = [];
    if (authorUID) constraints.push(where('authorUID', '==', authorUID));
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(PAGE_SIZE));

    const postsQuery = query(collection(db, 'posts'), ...constraints);

    const unsubscribe = onSnapshot(
      postsQuery,
      async (snapshot) => {
        setLoading(true);

        const postsData = snapshot.docs.map((doc) => {
          const post = doc.data() as Post;
          return {
            id: doc.id,
            ...post,
            createdAt: convertCreatedAt(post.createdAt),
          };
        });

        if (postsData.length < PAGE_SIZE) setHasMore(false);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        if (postsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

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
      },
      (error) => {
        console.error('Erro ao buscar posts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authorUID]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const constraints: QueryConstraint[] = [];
    if (authorUID) constraints.push(where('authorUID', '==', authorUID));
    constraints.push(orderBy('createdAt', 'desc'));
    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(PAGE_SIZE));

    const postsQuery = query(collection(db, 'posts'), ...constraints);
    const snapshot = await getDocs(postsQuery);

    const newPostsData = snapshot.docs.map((doc) => {
      const post = doc.data() as Post;
      return {
        id: doc.id,
        ...post,
        createdAt: convertCreatedAt(post.createdAt),
      };
    });

    if (newPostsData.length < PAGE_SIZE) setHasMore(false);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (newPostsData.length === 0) {
      setLoading(false);
      return;
    }

    const authorUIDs = Array.from(new Set(newPostsData.map((p) => p.authorUID)));
    const usersQuery = query(collection(db, 'users'), where('uid', 'in', authorUIDs));
    const usersSnap = await getDocs(usersQuery);
    const usersMap: { [uid: string]: User } = {};
    usersSnap.docs.forEach((doc) => {
      usersMap[doc.id] = doc.data() as User;
    });

    const newPostsWithUser: PostWithUser[] = newPostsData.map((post) => ({
      ...post,
      user: usersMap[post.authorUID] || undefined,
    }));

    setPosts((prev) => [...prev, ...newPostsWithUser]);
    setLoading(false);
  };

  if (loading && posts.length === 0) return <p className={styles.loading}>Carregando posts...</p>;
  if (!posts.length)
    return (
      <p className={styles.empty}>
        {authorUID ? 'Nenhum post encontrado para este autor' : 'Nenhum post encontrado'}
      </p>
    );

  return (
    <section className={styles.grid}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <button className={styles.loadMore} onClick={loadMore} disabled={loading}>
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </section>
  );
}
