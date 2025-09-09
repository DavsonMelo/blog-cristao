import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, PostWithUser, User } from '@/lib/types';
import PostDetailClient from './PostDetailClient';
import { Timestamp } from 'firebase/firestore';
import { Metadata } from 'next';

// app/posts/[postId]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.postId);

  if (!postData) {
    return {
      title: 'Post não encontrado',
      description: 'Este post não está disponível.',
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://blog-cristao.vercel.app/';
  const postUrl = `${baseUrl}/posts/${resolvedParams.postId}`;

  
  const imageUrl = postData.featuredImageUrl
  ? postData.featuredImageUrl.startsWith('http')
    ? postData.featuredImageUrl
    : `${baseUrl}${postData.featuredImageUrl}`
  : `${baseUrl}/default-og-image.jpg`;


  return {
    title: postData.title || 'Post sem título',
    description:
      postData.excerpt || 'Leia mais sobre este post no Blog Cristão!',
    openGraph: {
      title: postData.title || 'Post sem título',
      description:
        postData.excerpt || 'Leia mais sobre este post no Blog Cristão!',
      url: postUrl,
      images: [
            {
              url: imageUrl,
              width: 800,
              height: 400,
              alt: postData.title || 'Imagem do post',
            },
          ],
      type: 'article',
      locale: 'pt_BR',
      siteName: 'Blog Cristão',
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title || 'Post sem título',
      description:
        postData.excerpt || 'Leia mais sobre este post no Blog Cristão!',
      images: [imageUrl],
    },
  };
}

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
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostDetailPage({ params }: PostPageProps) {
  const { postId } = await params;
  const postData = await getPostData(postId);

  if (!postData) return <p>Post não encontrado</p>;

  return <PostDetailClient initialPost={postData} postId={postId} />;
}
