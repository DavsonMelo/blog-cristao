'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useDraftPost } from '@/app/context/DraftPostContext';
import styles from './styles.module.scss';

export default function CreatePostPage() {
  const router = useRouter();
  const user = useAuthRedirect();
  const { draft, setDraft } = useDraftPost();
  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(draft?.imageFile || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(draft?.previewUrl || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_CONTENT_LENGTH = 700;

  // Limpar mensagem de erro após 3 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Lidar com seleção de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Lidar com clique em "Preview"
  const handlePreview = () => {
    if (!title || !content || !imageFile) {
      setError('Todos os campos são obrigatórios!');
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`O conteúdo deve ter no máximo ${MAX_CONTENT_LENGTH} caracteres.`);
      return;
    }

    setLoading(true);
    setDraft({
      title,
      content,
      imageFile,
      previewUrl: URL.createObjectURL(imageFile),
    });
    setError('');
    router.push('/posts/preview');
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className={styles.createPost}>
      <h1 className={styles.title}>Criar Novo Post</h1>
      <form className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Título do post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className={styles.input}
          placeholder="Conteúdo do post"
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CONTENT_LENGTH) {
              setContent(e.target.value);
            }
          }}
          required
          rows={10}
          maxLength={MAX_CONTENT_LENGTH}
        />
        <input
          className={styles.input}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
        />
        <button
          className={styles.button}
          type="button"
          onClick={handlePreview}
          disabled={loading}
        >
          Preview ({content.length}/{MAX_CONTENT_LENGTH})
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}