// types.ts
import { FieldValue, Timestamp } from 'firebase/firestore'; // Importe o tipo Timestamp

export interface Post {
  // O 'id' é o ID do documento no Firestore, e geralmente é adicionado
  // no lado do cliente quando você busca os dados. Não precisa estar aqui.
  id?: string;
  authorUID: string; // ID do autor (consistente com Firebase Auth)
  title: string; // Título do post
  content: string; // Conteúdo completo
  excerpt: string; // Resumo para a home
  featuredImageUrl?: string; // URL da imagem em destaque (mais descritivo)
  likesCount: number; // Contador de likes (mais descritivo)
  commentsCount: number; // Contador de comentários (mais descritivo)
  createdAt: string | null;
}
// types.ts
export interface User {
  uid: string; // O ID único do usuário, crucial para o link
  name: string; // Nome do autor, para exibir no post
  email: string;
  profileImageUrl?: string; // URL da foto de perfil (mais descritivo)
  createdAt?: string | null; // Adicionado para corresponder aos dados do Firestore
}
// Post combinado com usuário (para consumo no front-end)
export interface PostWithUser extends Post {
  imagePublicId: any;
  id: string;
  user?: User;
}
export interface Comment {
  id: string;
  content: string;
  authorUID: string;
  authorName: string;
  createdAt: string | null;
  likesCount: number;
  likedByUser: boolean; // Novo campo para indicar se o usuário curtiu
}
