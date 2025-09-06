'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftPost } from '@/app/context/DraftPostContext';
import { useAutoSave } from '@/hooks/useAutoSave';
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

export default function CreatePostPageClient({ user }: CreatePostPageClientProps) {
  const router = useRouter();
  const { draft, setDraft } = useDraftPost();

  // ---------------------------
  // Estados locais do formulário
  // ---------------------------
  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(draft?.imageFile || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_CONTENT_LENGTH = 700;

  // ----------------------------------------
  // Hook de auto-save (salva rascunho no localStorage)
  // ----------------------------------------
  const { loadSavedData, clearSavedData } = useAutoSave<DraftData>(
    { title, content, timestamp: Date.now() },
    'postDraft',
    3000
  );

  // ---------------------------------------------------
  // Recupera rascunho salvo no localStorage ao carregar
  // ---------------------------------------------------
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

  // -------------------------------
  // Função de preview do post
  // -------------------------------
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

  // ---------------------------------------------
  // Prefetch manual para /posts/preview no botão
  // ---------------------------------------------
  const handlePrefetch = () => {
    if (title.length > 3 && content.length > 10) {
      router.prefetch('/posts/preview');
      if (process.env.NODE_ENV === 'development') {
        console.log('Prefetch /posts/preview disparado!');
      }
    }
  };

  // -------------------------------
  // Função para limpar o rascunho
  // -------------------------------
  const handleClearDraft = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setDraft(null);
    clearSavedData();
  };

  // -------------------------------
  // Renderização do formulário
  // -------------------------------
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
            onMouseEnter={handlePrefetch} // pré-carrega rota no hover
            onFocus={handlePrefetch} // pré-carrega rota no foco
            onTouchStart={handlePrefetch} // pré-carrega rota no toque mobile
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
