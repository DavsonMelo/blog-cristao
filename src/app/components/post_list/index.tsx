'use client'; 
// Informa ao Next.js que este componente roda no cliente (browser).

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
// Importa funções e tipos do Firestore para manipulação de dados em tempo real e consultas.

import { db } from '@/lib/firebase'; // Conexão com o banco de dados Firebase
import PostCard from '@/app/components/post_card'; // Componente para exibir cada post
import type { PostWithUser, Post, User } from '@/lib/types'; // Tipagens usadas
import styles from './styles.module.scss'; // Estilos específicos deste componente

interface PostListProps {
  authorUID?: string; // Propriedade opcional para filtrar posts de um autor específico
}

export default function PostList({ authorUID }: PostListProps = {}) {
  // Estado para armazenar posts já carregados
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  // Indica se está carregando dados
  const [loading, setLoading] = useState(true);
  // Indica se ainda há mais posts para carregar
  const [hasMore, setHasMore] = useState(true);
  // Guarda o último documento carregado (para paginação)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const PAGE_SIZE = 10; // Quantidade de posts por "página"

  // Função que converte o campo createdAt para string ISO (tratando possíveis formatos)
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

  // Hook para buscar posts quando o componente é montado ou quando muda o autorUID
  useEffect(() => {
    const constraints: QueryConstraint[] = [];
    if (authorUID) constraints.push(where('authorUID', '==', authorUID)); // filtra por autor se existir
    constraints.push(orderBy('createdAt', 'desc')); // ordena por data de criação desc
    constraints.push(limit(PAGE_SIZE)); // limita à quantidade da página

    const postsQuery = query(collection(db, 'posts'), ...constraints);

    // Escuta em tempo real os posts dessa query
    const unsubscribe = onSnapshot(
      postsQuery,
      async (snapshot) => {
        setLoading(true);

        // Extrai dados de cada documento
        const postsData = snapshot.docs.map((doc) => {
          const post = doc.data() as Post;
          return {
            id: doc.id,
            ...post,
            createdAt: convertCreatedAt(post.createdAt),
          };
        });

        // Verifica se ainda há mais posts para carregar
        if (postsData.length < PAGE_SIZE) setHasMore(false);
        // Atualiza o último documento (para paginação)
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        // Se não houver posts, reseta e para
        if (postsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // Busca informações dos autores para juntar aos posts
        const authorUIDs = Array.from(
          new Set(postsData.map((p) => p.authorUID))
        );
        const usersQuery = query(
          collection(db, 'users'),
          where('uid', 'in', authorUIDs)
        );
        const usersSnap = await getDocs(usersQuery);
        const usersMap: { [uid: string]: User } = {};
        usersSnap.docs.forEach((doc) => {
          usersMap[doc.id] = doc.data() as User;
        });

        // Combina os posts com seus respectivos autores
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

    return () => unsubscribe(); // limpa o listener quando desmonta
  }, [authorUID]);

  // Função para carregar mais posts (paginações subsequentes)
  const loadMore = async () => {
    if (!hasMore || loading) return; // evita chamadas desnecessárias

    setLoading(true);
    const constraints: QueryConstraint[] = [];
    if (authorUID) constraints.push(where('authorUID', '==', authorUID));
    constraints.push(orderBy('createdAt', 'desc'));
    if (lastDoc) constraints.push(startAfter(lastDoc)); // começa após o último doc
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

    // Busca informações dos autores
    const authorUIDs = Array.from(
      new Set(newPostsData.map((p) => p.authorUID))
    );
    const usersQuery = query(
      collection(db, 'users'),
      where('uid', 'in', authorUIDs)
    );
    const usersSnap = await getDocs(usersQuery);
    const usersMap: { [uid: string]: User } = {};
    usersSnap.docs.forEach((doc) => {
      usersMap[doc.id] = doc.data() as User;
    });

    // Combina novos posts com usuários
    const newPostsWithUser: PostWithUser[] = newPostsData.map((post) => ({
      ...post,
      user: usersMap[post.authorUID] || undefined,
    }));

    // Adiciona ao estado anterior
    setPosts((prev) => [...prev, ...newPostsWithUser]);
    setLoading(false);
  };

  // Renderização condicional:
  if (loading && posts.length === 0)
    return <p className={styles.loading}>Carregando posts...</p>;

  if (!posts.length)
    return (
      <p className={styles.empty}>
        {authorUID
          ? 'Nenhum post encontrado para este autor'
          : 'Nenhum post encontrado'}
      </p>
    );

  // Renderização principal
  return (
    <div className={styles.container}>
      <h2>
        fique à vontade para criar seu proprio Card e enviar a quem você ama!
      </h2>
      <section className={styles.grid}>
        {/* Renderiza cada post em um PostCard */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {/* Botão para carregar mais posts, se houver */}
        {hasMore && (
          <button
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        )}
      </section>
    </div>
  );
}
