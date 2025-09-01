'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { useDraftPost } from '@/app/context/DraftPostContext';
import { Post, User } from '@/types';

interface DraftPost {
  title: string;
  content: string;
  imageFile?: File;
  previewUrl?: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const user = useAuthRedirect();
  const [loading, setLoading] = useState(false);
  const { draft, setDraft } = useDraftPost();

  const previewExcerpt = draft?.content
    ? draft.content.length > 200
      ? draft.content.slice(0, 200) + '...'
      : draft.content
    : '';

  if (!draft || !user) return null;

  const handlePublish = async () => {
    if (!draft || !draft.imageFile) return;
    setLoading(true);

    try {
      // 1. Verificar se o usuário já tem um documento na coleção 'users'
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Criar documento do usuário se não existir
        const userData: User = {
          uid: user.uid,
          name: user.displayName || 'Usuário Anônimo',
          email: user.email || '',
          profileImageUrl: user.photoURL || '/default-avatar.jpg',
        };
        await setDoc(userRef, userData);
      }

      // 2. Fazer upload da imagem para o Cloudinary
      const formData = new FormData();
      formData.append('file', draft.imageFile);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      const featuredImageUrl = data.secure_url;

      // 3. Criar o post
      const excerpt =
        draft.content.length > 200
          ? draft.content.slice(0, 200) + '...'
          : draft.content;

      const newPost: Partial<Post> = {
        title: draft.title,
        content: draft.content,
        excerpt,
        featuredImageUrl,
        authorUID: user.uid,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      };

      await addDoc(collection(db, 'posts'), newPost);
      setDraft(null);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao publicar post: ' + err.message);
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
      <p className={styles.content}>{previewExcerpt}</p>

      <div className={styles.interations}>
        <Heart size={18} />
        <MessageSquare size={18} />
        <Share2 size={18} />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={() => router.push('/posts/create')}
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
    </div>
  );
}