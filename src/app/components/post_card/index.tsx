'use client';

import styles from './styles.module.scss';
import type { PostWithUser } from '@/types';
import { Heart, MessageSquare, Share2 } from 'lucide-react';

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  // Garantimos que a data e o resumo existam
  const excerpt = post.excerpt; 
  // Usa o nome e a URL de perfil do usuário, com um fallback
  const authorName = post.user?.name || 'Autor Desconhecido';
  const authorImage = post.user?.profileImageUrl || '/default-avatar.jpg';

  return (
    <div className={styles.card}>
      <div className={styles.author}>
        <img
          src={authorImage}
          alt={authorName}
          className={styles.avatar}
        />
        <span className={styles.name}>{authorName}</span>
      </div>

      <h2 className={styles.title}>{post.title}</h2>

      {post.featuredImageUrl && (
        <div className={styles.imageWrapper}>
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className={styles.image}
          />
        </div>
      )}

      <p className={styles.content}>{excerpt}</p>

      <div className={styles.interations}>
        <span>
          <Heart size={18} /> {post.likesCount || 0}
        </span>
        <span>
          <MessageSquare size={18} /> {post.commentsCount || 0}
        </span>
        <span>
          <Share2 size={18} />
        </span>
      </div>
    </div>
  );
}