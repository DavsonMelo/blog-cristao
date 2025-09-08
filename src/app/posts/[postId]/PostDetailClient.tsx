'use client';

import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { PostWithUser, User } from '@/lib/types';
import styles from './styles.module.scss';
import { Heart, MessageSquare, Share2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useComments } from '@/hooks/useComments';

interface PostDetailClientProps {
  initialPost: PostWithUser;
  postId: string;
}

export default function PostDetailClient({
  initialPost,
  postId,
}: PostDetailClientProps) {
  const [firebaseUser] = useAuthState(auth);
  const user: User | null = firebaseUser
    ? {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Usuário',
        profileImageUrl: firebaseUser.photoURL || '/default-avatar.jpg',
        email: firebaseUser.email || '',
        createdAt: null,
      }
    : null;

  const { liked, likesCount, toggleLike } = usePostLikes(initialPost, user ?? null);
  const { comments, toggleCommentLike, addComment } = useComments(postId, user);

  const [post, setPost] = useState<PostWithUser | null>(initialPost);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [puser, loadingUser] = useAuthState(auth);
  const [comment, setComment] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!postId) {
      setError('Post inválido');
      setLoading(false);
      return;
    }

    const postRef = doc(db, 'posts', postId);
    getDoc(postRef).then(async (postSnap) => {
      if (!postSnap.exists()) {
        setError('Post não encontrado');
        setLoading(false);
        return;
      }

      const postData = postSnap.data() as PostWithUser;
      const userRef = doc(db, 'users', postData.authorUID);
      const userSnap = await getDoc(userRef);
      let userData: User | undefined;

      if (userSnap.exists()) {
        const rawUserData = userSnap.data() as User;
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

      setPost({
        ...postData,
        id: postSnap.id,
        createdAt,
        user: userData,
      });

      setLoading(false);
    });
  }, [postId]);


  const handleAuthorClick = () => {
    if (post?.authorUID) {
      router.push(`/posts/author/${post.authorUID}`);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      toast.error('O comentário não pode estar vazio');
      return;
    }
    try {
      await addComment(comment);
      setComment('');
      toast.success('Comentário enviado');
    } catch (error) {
      toast.error('Erro ao enviar comentário');
    }
  };

  const handleShare = () => {
    if (!user) {
      toast.error('Você precisa estar logado para compartilhar');
      return;
    }
    const url = `${window.location.origin}/posts/${postId}`;
    const text = `Confira este post: ${post?.title || 'Post'} - ${url}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!post) return null;

  return (
    <div className={styles.sectionView}>
      <a href="/" className={styles.callAction}>
        Leia mais posts inspiradores
        <br />
        clicando aqui
      </a>
      <div className={styles.postView}>
        <div className={styles.authorInfo}>
          <div
            className={styles.author}
            onClick={handleAuthorClick}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={post.user?.profileImageUrl || '/default-avatar.jpg'}
              alt={post.user?.name || 'Usuário'}
              className={styles.avatar}
            />
            <span className={styles.name}>{post.user?.name || 'Usuário'}</span>
          </div>
          <span className={styles.createdAt}>
            {post.createdAt &&
              format(new Date(post.createdAt), 'd MMM yyyy, HH:mm', {
                locale: ptBR,
              })}
          </span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        {post.featuredImageUrl && (
          <div className={styles.imageWrapper}>
            <img
              src={post.featuredImageUrl}
              alt="Post Image"
              width={800}
              height={400}
              className={styles.image}
            />
          </div>
        )}
        <p className={styles.content}>{post.content}</p>
        <div className={styles.interations}>
          <span
            onClick={toggleLike}
            style={{ cursor: user && !loadingUser ? 'pointer' : 'not-allowed' }}
          >
            <Heart
              size={18}
              fill={liked ? 'red' : 'none'}
              color={liked ? 'red' : 'currentColor'}
            />
            {likesCount}
          </span>
          <span style={{ cursor: 'not-allowed' }}>
            <MessageSquare size={18} /> {comments.length}
          </span>
          <span
            onClick={handleShare}
            style={{ cursor: user && !loadingUser ? 'pointer' : 'not-allowed' }}
          >
            <Share2 size={18} />
          </span>
        </div>
        <div className={styles.comments}>
          <h2>Comentários</h2>
          <div className={styles.sendButton}>
            <textarea
              className={styles.input}
              placeholder="Comente ..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
            />
            <Send
              className={styles.sendIcon}
              size={25}
              onClick={handleCommentSubmit}
            />
          </div>
          <div className={styles.commentList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.authorName}
                  </span>
                  {comment.createdAt && (
                    <span className={styles.commentDate}>
                      {format(
                        new Date(comment.createdAt),
                        'd MMM yyyy, HH:mm',
                        { locale: ptBR }
                      )}
                    </span>
                  )}
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
                <span
                  onClick={() =>
                    toggleCommentLike(comment.id, comment.likedByUser)
                  }
                  className={styles.commentLike}
                >
                  <Heart
                    size={18}
                    fill={comment.likedByUser ? 'red' : 'none'}
                    color={comment.likedByUser ? 'red' : 'currentColor'}
                  />
                  {comment.likesCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
