'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import styles from './styles.module.scss';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useDraftPost } from "@/app/context/DraftPostContext";
import { Post } from "@/types";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const MAX_CONTENT_LENGTH = 700;

  // 🔒 Checa autenticação


  useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(""), 3000); // 3 segundos
    return () => clearTimeout(timer);
  }
}, [error]);

  

  const { draft, setDraft } = useDraftPost()

  useEffect(() => {
  if (draft) {
    setTitle(draft.title || '');
    setContent(draft.content || '');
    setImageFile(draft.imageFile || null);
    setPreviewUrl(draft.previewUrl || null);
  }
}, [draft]);

  // Quando o usuário clica em Preview
  const handlePreview = () => {
    if (!title || !content || !imageFile) {
      setError('Todos os campos são obrigatórios!');
      return;
    }
    if(content.length > MAX_CONTENT_LENGTH) {
      setError(`O conteúdo deve ter no máximo ${MAX_CONTENT_LENGTH} caracteres.`);
      return;
    }
    setDraft({
      title,
      content,
      imageFile,
      previewUrl: URL.createObjectURL(imageFile),
    })

    setError('');
    // segue o fluxo
    router.push('/posts/preview');
  };

  // função para converter File para base64
const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🔒 Checa autenticação
  const user = useAuthRedirect();

  // ⬆️ Envia imagem
  // const { uploading, imageUrl, handleImageUpload } = useImageUpload();
  const handlePost = async () => {
  if (!user) return;

  if (!title || !content || !imageFile) {
    setError("Preencha título e conteúdo e selecione uma imagem!");
    return;
  }
  if(content.length > MAX_CONTENT_LENGTH) {
    setError(`O conteúdo deve ter no máximo ${MAX_CONTENT_LENGTH} caracteres.`)
    return;
  }

  setLoading(true);

  try {
    setDraft({
      title,
      content,
      imageFile,
      previewUrl: URL.createObjectURL(imageFile),
    });

    setError('');
    router.push('/posts/preview');
  } catch (err: any) {
    console.error(err);
    setError("Erro ao criar post: " + err.message);
  } finally {
    setLoading(false);
  }
  };


  if (!user) return null;

  return (
    <div className={styles.createPost}>
      <h1 className={styles.title}>Criar Novo Post</h1>
      <form className={styles.form} onSubmit={handlePost}>
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
            if(e.target.value.length <= MAX_CONTENT_LENGTH) {
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
          onClick={() => handlePreview()}
        >
          Preview ({content.length}/{MAX_CONTENT_LENGTH})
        </button>

        {/* aqui aparece a mensagem de erro, se existir */}
        {error && <p className={styles.error}>{error}</p>}

      </form>
    </div>
  );
}

// Especificações do arquivo
/*
Visão Geral
Este é um Client Component em Next.js, responsável por renderizar e gerenciar a lógica de criação de um novo post. Ele lida com a autenticação do usuário, o estado do formulário (título, conteúdo, imagem), o upload da imagem para uma API externa e o envio dos dados do post para o banco de dados do Firebase Firestore.

Funcionalidades Principais
1. Gerenciamento de Estado
O componente utiliza vários estados do React para controlar a interface e os dados:

user: Armazena as informações do usuário logado. É usado para verificar a autenticação e associar o post ao ID do autor.

title: Guarda o texto digitado no campo de título.

content: Guarda o texto digitado no campo de conteúdo.

imageUrl: Armazena a URL da imagem após o upload bem-sucedido para o Cloudinary.

loading: Um booleano que controla o estado do botão de submissão do formulário, desativando-o para evitar múltiplos cliques e mudando seu texto.

uploading: Um booleano que indica se o upload da imagem está em andamento, exibindo uma mensagem de "enviando..." para o usuário.

2. Autenticação e Redirecionamento
Um useEffect é usado para configurar um "listener" de autenticação do Firebase (auth.onAuthStateChanged).

Ele monitora o estado de autenticação do usuário. Se o usuário não estiver logado (!u), ele o redireciona imediatamente para a página inicial (/) usando o router.push.

Se o usuário estiver logado, o estado user é atualizado com as informações de autenticação.

3. Upload de Imagem
A função handleImageUpload é acionada quando o usuário seleciona um arquivo de imagem.

Ela utiliza a API nativa FormData para preparar o arquivo para envio.

Faz uma requisição fetch do tipo POST para a rota de API interna /api/upload.

Após a resposta, se a requisição for bem-sucedida, a URL segura da imagem (data.secure_url) é armazenada no estado imageUrl, que é então usada para exibir uma pré-visualização.

Mensagens de erro são exibidas caso o upload falhe.

4. Submissão do Formulário
A função handleSubmit é chamada quando o formulário é submetido.

Ela previne o comportamento padrão do navegador de recarregar a página (e.preventDefault()).

Primeiro, ela realiza uma validação simples para garantir que o título e o conteúdo não estejam vazios.

Em seguida, cria um trecho (excerpt) do conteúdo, limitando-o a 200 caracteres, para ser salvo no banco de dados.

Utiliza a função addDoc do Firebase Firestore para criar um novo documento na coleção 'posts'.

Os dados do post, incluindo title, content, excerpt, imageUrl, o ID do autor (user.uid), a data de criação (serverTimestamp()) e contadores iniciais de likes e comments, são salvos no documento.

Após o sucesso, exibe um alerta e redireciona o usuário para a página inicial (/).

Possui um bloco try-catch-finally para tratar erros e garantir que o estado loading seja sempre resetado, independentemente do resultado.

5. Renderização Condicional
O formulário e o conteúdo da página só são renderizados se o estado user for verdadeiro (ou seja, se houver um usuário logado). Isso evita a renderização de elementos antes que a verificação de autenticação seja concluída.

A pré-visualização da imagem (<img>) é exibida apenas se a variável de estado imageUrl contiver uma URL.

O texto e o estado do botão de submissão são dinamicamente alterados com base no estado loading.
*/
