'use client';

import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import styles from './styles.module.scss';
import { auth } from '@/lib/firebase';
import type { PostWithUser, User } from '@/lib/types';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePostLikes } from "@/hooks/usePostLikes";

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const [firebaseUser] = useAuthState(auth);
  const user: User | null = firebaseUser
    ?{
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || 'Usuário',
      profileImageUrl: firebaseUser.photoURL || '/default-avatar.jpg',
      email: firebaseUser.email || '',
      createdAt: null,
    }
    : null;
    
  const {liked, likesCount, toggleLike} = usePostLikes(post, user ?? null);
  const router = useRouter(); // Garantimos que a data e o resumo existam
  const excerpt = post.excerpt;
  // Usa o nome e a URL de perfil do usuário, com um fallback
  const authorName = post.user?.name || 'Autor Desconhecido';
  const authorImage = post.user?.profileImageUrl || '/default-avatar.jpg';
  const createdAt = post.createdAt;

  const handleAuthorClick = () => {
    if (post.authorUID) {
      router.push(`/posts/author/${post.authorUID}`);
    }
  };

  // Função para toggle like

  return (
    <div className={styles.card}>
      {/* Classe do logo do autor, nome do autor e data de criação */}
      <div className={styles.authorInfo}>
        {/* Classe do logo do autor e nome do autor */}
        <div className={styles.author} onClick={handleAuthorClick}>
          <img
            src={authorImage}
            alt={authorName}
            className={styles.avatar}
            style={{ cursor: 'pointer' }}
          />
          {/* Classe do nome do autor */}
          <span className={styles.name} style={{ cursor: 'pointer' }}>
            {authorName}
          </span>
        </div>
        {createdAt && (
          // Classe da data de criação
          <span className={styles.createdDate}>
            {format(new Date(createdAt), 'd MMM yyyy, HH:mm', { locale: ptBR })}
          </span>
        )}
      </div>

      <h2 className={styles.title}>{post.title}</h2>

      {post.featuredImageUrl && (
        <div
          className={styles.imageWrapper}
          onClick={() => router.push(`/posts/${post.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className={styles.image}
          />
        </div>
      )}

      <p className={styles.content}>{excerpt}</p>

      <div className={styles.interations}>
        <span
          onClick={toggleLike}
          style={{ cursor: user ? 'pointer' : 'not-allowed' }}
        >
          <Heart
            size={18}
            fill={liked ? 'red' : 'none'}
            color={liked ? 'red' : 'currentColor'}
          />
          {likesCount}
        </span>
        <span>
          <MessageSquare
            size={18}
            onClick={() => router.push(`/posts/${post.id}`)}
            style={{ cursor: 'pointer' }}
          />{' '}
          {post.commentsCount || 0}
        </span>
        <span>
          <Share2 size={18} />
        </span>
      </div>
    </div>
  );
}
