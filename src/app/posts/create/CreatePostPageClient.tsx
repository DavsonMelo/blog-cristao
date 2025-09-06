'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftPost } from '@/app/context/DraftPostContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { usePrefetch } from '@/hooks/usePrefetch';
import styles from './styles.module.scss';

interface CreatePostPageClientProps {
  user: {
    uid: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
}

interface DraftData {
  title: string;
  content: string;
  timestamp: number;
}

export default function CreatePostPageClient({
  user,
}: CreatePostPageClientProps) {
  const router = useRouter();
  const { draft, setDraft } = useDraftPost();

  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(
    draft?.imageFile || null
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_CONTENT_LENGTH = 700;

  const { loadSavedData, clearSavedData } = useAutoSave<DraftData>(
    { title, content, timestamp: Date.now() },
    'postDraft',
    3000
  );

  usePrefetch('/posts/preview', title.length > 3 && content.length > 10);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('postDraft');
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        return null;
      }
    };

    if (!draft) {
      const savedDraft = load();
      if (savedDraft) {
        setTitle(savedDraft.title || '');
        setContent(savedDraft.content || '');
        console.log('Rascunho recuperado do auto-save');
      }
    }
  }, [draft]);

  const handlePreview = () => {
    if (!title || !content || !imageFile) {
      setError('Todos os campos são obrigatórios!');
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(
        `O conteúdo deve ter no máximo ${MAX_CONTENT_LENGTH} caracteres.`
      );
      return;
    }

    setLoading(true);
    clearSavedData();

    setDraft({
      title,
      content,
      imageFile,
      previewUrl: URL.createObjectURL(imageFile),
      authorUID: user.uid,
      authorEmail: user.email,
    });

    setError('');
    router.push('/posts/preview');
    setLoading(false);
  };

  const handleClearDraft = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setDraft(null);
    clearSavedData();
  };

  return (
    <div className={styles.createPost}>
      <h1 className={styles.title}>Criar Novo Post</h1>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
        Logado como: {user.email}
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className={styles.input}
          required
        />
        <textarea
          placeholder="Conteúdo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_CONTENT_LENGTH}
          className={styles.textarea}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className={styles.input}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className={styles.previewButton}
          >
            {loading ? 'Carregando...' : 'Preview'}
          </button>
          <div className={styles.autoSaveStatus}>
            {title || content ? '✓ Rascunho sendo salvo automaticamente' : ''}
          </div>
          {(title || content || imageFile) && (
            <button
              onClick={handleClearDraft}
              className={styles.clearButton}
              type="button"
            >
              Limpar Rascunho
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
