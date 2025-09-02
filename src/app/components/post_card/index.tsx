'use client';

import { useState, useEffect } from "react";
import { getDoc, doc, getDocs, setDoc, deleteDoc, increment, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from './styles.module.scss';
import { db, auth } from "@/lib/firebase";
import type { PostWithUser } from '@/types';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';


interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const [user, loadingUser] = useAuthState(auth);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const router = useRouter();  // Garantimos que a data e o resumo existam
  const excerpt = post.excerpt; 
  // Usa o nome e a URL de perfil do usuário, com um fallback
  const authorName = post.user?.name || 'Autor Desconhecido';
  const authorImage = post.user?.profileImageUrl || '/default-avatar.jpg';

  // Verificar se o usuário já curtiu o post
  useEffect(() => {
    if (user && post.id) {
      const checkLike = async () => {
        const likeRef = doc(db, `posts/${post.id}/likes/${user.uid}`);
        const likeSnap = await getDoc(likeRef);
        setLiked(likeSnap.exists());
      };
      checkLike();
    }
  }, [user, post.id]);

  const handleAuthorClick = () => {
    if(post.authorUID) {
      router.push(`/posts/author/${post.authorUID}`);
    }
  };

  // Função para toggle like
  const handleLike = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    const postRef = doc(db, 'posts', post.id);
    const likeRef = doc(db, `posts/${post.id}/likes/${user.uid}`);

    if (liked) {
      // Descurtir
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
      setLiked(false);
      setLikesCount((prev) => prev - 1);
      toast.success('Like removido');
    } else {
      // Curtir
      await setDoc(likeRef, { likedAt: serverTimestamp() });
      await updateDoc(postRef, { likesCount: increment(1) });
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      toast.success('Post curtido');
    }
  };


  return (
    <div className={styles.card}>
      <div className={styles.author} onClick={handleAuthorClick}>
        <img
          src={authorImage}
          alt={authorName}
          className={styles.avatar}
          style={{ cursor: 'pointer' }}
        />
        <span className={styles.name} style={{ cursor: 'pointer' }}>{authorName}</span>
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
        <span onClick={handleLike} style={{ cursor: user ? 'pointer' : 'not-allowed' }}>
          <Heart size={18} fill={liked ? 'red' : 'none'} color={liked ? 'red' : 'currentColor'}/>
          {likesCount}
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