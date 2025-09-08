'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { PostWithUser, User } from '@/lib/types';
import { db } from '@/lib/firebase';

export function usePostLikes(post: PostWithUser, user: User | null) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  useEffect(() => {
    if (!user) return; // usuário não logado, apenas exibe likes
    if (!post.id) return;

    const checkUserLike = async () => {
      const likeRef = doc(db, `posts/${post.id}/likes/${user.uid}`);
      const likeSnap = await getDoc(likeRef);
      setLiked(likeSnap.exists());
    };

    checkUserLike();
  }, [user, post.id]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    if (!post.id) return;

    const postRef = doc(db, 'posts', post.id);
    const likeRef = doc(db, `posts/${post.id}/likes/${user.uid}`);

    try {
      if (liked) {
        // descurtir
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success('Like removido');
      } else {
        // curtir
        await setDoc(likeRef, { likedAt: serverTimestamp() });
        await updateDoc(postRef, { likesCount: increment(1) });
        setLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('Post curtido');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar like');
    }
  };

  return { liked, likesCount, toggleLike };
}
