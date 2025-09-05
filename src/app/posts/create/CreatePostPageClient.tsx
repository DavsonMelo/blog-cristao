'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useDraftPost } from '@/app/context/DraftPostContext';
import { compressImage } from '@/lib/image-compression';
import { useAutoSave } from '@/hooks/useAutoSave';
import { usePrefetch } from '@/hooks/usePrefetch';
import styles from './styles.module.scss';

interface CreatePostPageClientProps {
  user?: {
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
  user: serverUser,
}: CreatePostPageClientProps) {
  const router = useRouter();
  const userFromClient = useAuthRedirect();
  const { draft, setDraft } = useDraftPost();
  const user = serverUser || userFromClient;

  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(
    draft?.imageFile || null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    draft?.previewUrl || null
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const MAX_CONTENT_LENGTH = 700;

  // 1. ✅ USO DO useAutoSave
  const { loadSavedData, clearSavedData } = useAutoSave<DraftData>(
    { title, content, timestamp: Date.now() },
    'postDraft',
    3000 // Salva a cada 3 segundos de inatividade
  );

  // 2. ✅ USO DO usePrefetch
  usePrefetch(
    '/posts/preview',
    title.length > 3 && content.length > 10 // Pré-carrega só quando válido
  );

  // Carregar rascunho salvo ao iniciar
  useEffect(() => {
    const savedDraft = loadSavedData();
    if (savedDraft && !draft?.title) {
      setTitle(savedDraft.title || '');
      setContent(savedDraft.content || '');
      console.log('Rascunho recuperado do auto-save');
    }
  }, [loadSavedData, draft]);

  // Limpar rascunho quando post for criado com sucesso
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title || content) {
        e.preventDefault();
        e.returnValue =
          'Você tem alterações não salvas. Tem certeza que deseja sair?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, content]);

  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      // ... (código existente da compressão) ...
    },
    []
  );

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

     // ✅ Verificação segura do user
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);

    // Limpar auto-save ao enviar para preview
    clearSavedData();

    setDraft({
      title,
      content,
      imageFile,
      previewUrl: URL.createObjectURL(imageFile),
      authorUID: user.uid,
      authorEmail: user.email ?? undefined,
    });

    setError('');
    router.push('/posts/preview');
    setLoading(false);
  };

  const handleClearDraft = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setPreviewUrl(null);
    clearSavedData();
    setError('Rascunho limpo com sucesso');
  };

  if (!user) return null;

  return (
    <div className={styles.createPost}>
      <h1 className={styles.title}>Criar Novo Post</h1>

      {/* Botão para limpar rascunho */}
      {(title || content) && (
        <button
          onClick={handleClearDraft}
          className={styles.clearButton}
          type="button"
        >
          Limpar Rascunho
        </button>
      )}

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        {/* ... (campos existentes) ... */}

        {/* Indicador de auto-save */}
        <div className={styles.autoSaveStatus}>
          {title || content ? '✓ Rascunho sendo salvo automaticamente' : ''}
        </div>
      </form>
    </div>
  );
}
