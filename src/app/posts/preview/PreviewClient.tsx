'use client';

import { useState, useEffect } from 'react';
import { resizeImage } from '@/utils/resizeImage';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useDraftPost } from '@/app/context/DraftPostContext';
import { Post, User } from '@/lib/types';
import styles from './styles.module.scss';

export default function PreviewClient() {
  const router = useRouter();
  const { draft, setDraft } = useDraftPost();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!draft) {
    return <p>Nenhum rascunho encontrado 😬</p>;
  }

  const handlePublish = async () => {
    if (!draft.title || !draft.content || !draft.imageFile) {
      setError('Título, conteúdo e imagem são obrigatórios!');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Confere se o usuário já existe no Firestore
      const userRef = doc(db, 'users', draft.authorUID);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData: User = {
          uid: draft.authorUID,
          name: draft.authorEmail.split('@')[0] || 'Usuário Anônimo',
          email: draft.authorEmail,
          profileImageUrl: draft.authorPhoto || '/default-avatar.jpg',
        };
        await setDoc(userRef, userData);
      }

      // 2️⃣ Redimensiona a imagem antes do upload
      const optimizedImage = await resizeImage(draft.imageFile);

      // 3️⃣ Prepara FormData para enviar para a API de upload
      const formData = new FormData();
      formData.append('file', optimizedImage);

      // 4️⃣ Chama a rota de upload do servidor
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await uploadRes.json();

      if (!data.secure_url || !data.public_id) {
        throw new Error('Falha no upload da imagem');
      }

      // 5️⃣ Cria o post no Firestore
      const excerpt =
        draft.content.length > 200
          ? draft.content.slice(0, 200) + '...'
          : draft.content;
      const newPost: Omit<Post, 'createdAt'> & { createdAt?: any } = {
        title: draft.title,
        content: draft.content,
        excerpt,
        featuredImageUrl: data.secure_url,
        imagePublicId: data.public_id,
        authorUID: draft.authorUID,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      };

      await addDoc(collection(db, 'posts'), newPost);

      // 6️⃣ Limpa o rascunho e redireciona
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
          src={draft.authorPhoto || '/default-avatar.jpg'}
          alt={draft.authorName}
          className={styles.avatar}
        />
        <span className={styles.name}>{draft.authorName}</span>
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
        {draft.content.length > 200
          ? draft.content.slice(0, 200) + '...'
          : draft.content}
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
