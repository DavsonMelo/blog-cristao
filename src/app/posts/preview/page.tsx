'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useDraftPost } from '@/app/context/DraftPostContext';
import { Post, User } from '@/types';
import styles from './styles.module.scss';

export default function PreviewPage() {
  const router = useRouter();
  const user = useAuthRedirect();
  const { draft, setDraft } = useDraftPost();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Limpar mensagem de erro após 3 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!draft || !user) return null;

  const handlePublish = async () => {
    if (!draft.title || !draft.content || !draft.imageFile) {
      setError('Título, conteúdo e imagem são obrigatórios!');
      return;
    }

    setLoading(true);
    try {
      // Criar documento do usuário, se necessário
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const userData: User = {
          uid: user.uid,
          name: user.displayName || 'Usuário Anônimo',
          email: user.email || '',
          profileImageUrl: user.photoURL || '/default-avatar.jpg',
        };
        await setDoc(userRef, userData);
      }

      // Fazer upload da imagem para o Cloudinary
      const formData = new FormData();
      formData.append('file', draft.imageFile);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error('Falha no upload da imagem');
      }

      // Criar o post no Firestore
      const excerpt = draft.content.length > 200 ? draft.content.slice(0, 200) + '...' : draft.content;

      const newPost: Omit<Post, 'createdAt'> & { createdAt?: any } = {
        title: draft.title,
        content: draft.content,
        excerpt,
        featuredImageUrl: data.secure_url,
        authorUID: user.uid,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      };
      await addDoc(collection(db, 'posts'), newPost);

      setDraft(null);
      router.push('/');
    } catch (err: any) {
      setError('Erro ao publicar post: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.previewPage}>
      <div className={styles.author}>
        <img
          src={user.photoURL || '/default-avatar.jpg'}
          alt={user.displayName ?? 'Usuário'}
          className={styles.avatar}
        />
        <span className={styles.name}>{user.displayName}</span>
      </div>
      <h1 className={styles.title}>{draft.title}</h1>
      {draft.previewUrl && (
        <div className={styles.imageWrapper}>
          <img
            src={draft.previewUrl}
            alt="Preview"
            width={800}
            height={400}
            className={styles.image}
          />
        </div>
      )}
      <p className={styles.content}>
        {draft.content.length > 200 ? draft.content.slice(0, 200) + '...' : draft.content}
      </p>
      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={() => router.push('/posts/create')}
          disabled={loading}
        >
          Voltar
        </button>
        <button
          className={styles.postButton}
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}