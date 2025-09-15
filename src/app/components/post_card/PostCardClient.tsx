// app/components/post_card/PostCardClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import styles from './styles.module.scss';
import { auth, db } from '@/lib/firebase';
import type { PostWithUser, User } from '@/lib/types';
import { Heart, MessageSquare, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCardClient({ post }: PostCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [firebaseUser] = useAuthState(auth);
  const user: User | null = firebaseUser
    ? {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Usuário',
        profileImageUrl: firebaseUser.photoURL || '/default-avatar.jpg',
        email: firebaseUser.email || '',
        createdAt: null,
      }
    : null;

  const { liked, likesCount, toggleLike } = usePostLikes(post, user ?? null);
  const router = useRouter();
  const excerpt = post.excerpt;
  const authorName = post.user?.name || 'Autor Desconhecido';
  const authorImage = post.user?.profileImageUrl || '/default-avatar.jpg';
  const createdAt = post.createdAt;

  const handleAuthorClick = () => {
    if (post.authorUID) router.push(`/posts/author/${post.authorUID}`);
  };

  const handleDelete = async () => {
    setDeleting(true); // inicia o loading
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          imagePublicId: post.imagePublicId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.refresh(); // Atualiza a lista de posts
      } else {
        console.error('Erro ao deletar:', data.error);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setDeleting(false); // termina o loading
    }
  };

  return (
    <>
      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Tem certeza que deseja excluir este post?</p>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  handleDelete();
                  setShowConfirm(false);
                }}
                className={styles.confirmButton}
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.authorInfo}>
          <div className={styles.author} onClick={handleAuthorClick}>
            <img
              src={authorImage}
              alt={authorName}
              className={styles.avatar}
              style={{ cursor: 'pointer' }}
            />
            <span className={styles.name} style={{ cursor: 'pointer' }}>
              {authorName}
            </span>
          </div>
          {createdAt && (
            <span className={styles.createdDate}>
              {format(new Date(createdAt), 'd MMM yyyy, HH:mm', {
                locale: ptBR,
              })}
            </span>
          )}
        </div>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{post.title}</h2>
          {user?.uid === post.authorUID && (
            <div className={styles.iconWrapper}>
              <div className={styles.trashButton}>
                <Trash2 onClick={() => setShowConfirm(true)} size={16} />
              </div>
              <span className={styles.tooltip}>Deletar post</span>
            </div>
          )}
        </div>
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
            <div className={styles.iconWrapper}>
              <Heart
                size={18}
                fill={liked ? 'red' : 'none'}
                color={liked ? 'red' : 'currentColor'}
              />
              <span className={styles.tooltip}>Curtir post</span>
            </div>
            {likesCount}
          </span>
          <span>
            <div className={styles.iconWrapper}>
              <MessageSquare
                size={18}
                onClick={() => router.push(`/posts/${post.id}`)}
                style={{ cursor: 'pointer' }}
              />
              <span className={styles.tooltip}>Ir para comentários</span>
            </div>
            {post.commentsCount || 0}
          </span>
          <span onClick={() => router.push(`/posts/${post.id}`)}>
            <div className={styles.iconWrapper}>
              <Eye size={18} />
              <span className={styles.tooltip}>Ver post completo</span>
            </div>
          </span>
        </div>
      </div>
    </>
  );
}
