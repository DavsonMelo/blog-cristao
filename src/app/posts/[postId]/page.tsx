import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, PostWithUser, User } from '@/types';
import type { Metadata, ResolvingMetadata } from 'next';
import PostDetailClient from './PostDetailClient';
import { Timestamp } from 'firebase/firestore';

// Função para buscar dados do post no servidor
async function getPostData(postId: string): Promise<PostWithUser | null> {
  const postRef = doc(db, 'posts', postId!);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    return null;
  }

  const postData = postSnap.data() as Post;
  const userRef = doc(db, 'users', postData.authorUID);
  const userSnap = await getDoc(userRef);
  let userData: User | undefined;
  if (userSnap.exists()) {
    const rawUserData = userSnap.data() as User;
    // Converter createdAt do userData para string ISO de forma segura
    let userCreatedAt: string | null = null;
    if (rawUserData.createdAt) {
      if (typeof rawUserData.createdAt === 'string') {
        userCreatedAt = rawUserData.createdAt;
      } else if (
        rawUserData.createdAt &&
        typeof rawUserData.createdAt === 'object' &&
        'toDate' in rawUserData.createdAt
      ) {
        userCreatedAt = (rawUserData.createdAt as Timestamp)
          .toDate()
          .toISOString();
      }
    }
    userData = { ...rawUserData, createdAt: userCreatedAt };
  }

  // Converter createdAt do postData para string ISO de forma segura
  let createdAt: string | null = null;
  if (postData.createdAt) {
    if (typeof postData.createdAt === 'string') {
      createdAt = postData.createdAt;
    } else if (
      postData.createdAt &&
      typeof postData.createdAt === 'object' &&
      'toDate' in postData.createdAt
    ) {
      createdAt = (postData.createdAt as Timestamp).toDate().toISOString();
    }
  }

  return {
    ...postData,
    id: postSnap.id,
    createdAt,
    user: userData,
  };
}

type PostPageProps = {
  params: {
    postId: string;
  };
};

// Definir metadados OG dinâmicos
export async function generateMetadata(
  { params }: any): Promise<Metadata> {
  const postData = await getPostData(params.postId);

  if (!postData) {
    return {
      title: 'Post não encontrado',
      description: 'Este post não está disponível.',
    };
  }

  return {
    title: postData.title || 'Post sem título',
    description:
      postData.excerpt || 'Leia mais sobre este post no Blog Cristão!',
    openGraph: {
      title: postData.title || 'Post sem título',
      description:
        postData.excerpt || 'Leia mais sobre este post no Blogfolio!',
      url: `${
        process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
      }/posts/${params.postId}`,
      images: postData.featuredImageUrl
        ? [
            {
              url: postData.featuredImageUrl,
              width: 800,
              height: 400,
              type: 'image/jpeg',
            },
          ]
        : undefined,
      type: 'article',
      locale: 'pt_BR',
      siteName: 'Blog Cristão',
    },
  };
}

export default async function PostDetailPage({ params }: any) {
  const { postId } = params;
  const postData = await getPostData(postId);

  if (!postData) return <p>Post não encontrado</p>;

  return <PostDetailClient initialPost={postData} postId={postId} />;
}
