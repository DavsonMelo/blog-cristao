'use client';

import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  increment,
  collection,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { PostWithUser, User } from '@/types';
import styles from './styles.module.scss';
import { Heart, MessageSquare, Share2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

interface Comment {
  id: string;
  content: string;
  authorUID: string;
  authorName: string;
  createdAt: string | null;
  likesCount: number;
  likedByUser: boolean;
}

interface PostDetailClientProps {
  initialPost: PostWithUser;
  postId: string;
}

export default function PostDetailClient({ initialPost, postId }: PostDetailClientProps) {
  const [post, setPost] = useState<PostWithUser | null>(initialPost);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, loadingUser] = useAuthState(auth);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialPost.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(initialPost.commentsCount || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!postId) {
      setError('Post inválido');
      setLoading(false);
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const unsubscribePost = onSnapshot(postRef, async (postSnap) => {
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
        // Converter createdAt do userData para string ISO de forma segura
        let userCreatedAt: string | null = null;
        if (rawUserData.createdAt) {
          if (typeof rawUserData.createdAt === 'string') {
            userCreatedAt = rawUserData.createdAt;
          } else if (rawUserData.createdAt && typeof rawUserData.createdAt === 'object' && 'toDate' in rawUserData.createdAt) {
            userCreatedAt = (rawUserData.createdAt as Timestamp).toDate().toISOString();
          }
        }
        userData = { ...rawUserData, createdAt: userCreatedAt };
      }

      // Converter createdAt do postData para string ISO de forma segura
      let createdAt: string | null = null;
      if (postData.createdAt) {
        if (typeof postData.createdAt === 'string') {
          createdAt = postData.createdAt;
        } else if (postData.createdAt && typeof postData.createdAt === 'object' && 'toDate' in postData.createdAt) {
          createdAt = (postData.createdAt as Timestamp).toDate().toISOString();
        }
      }

      setPost({
        ...postData,
        id: postSnap.id,
        createdAt,
        user: userData,
      });
      setLikesCount(postData.likesCount || 0);
      setCommentsCount(postData.commentsCount || 0);
      if (user) {
        const likeRef = doc(db, `posts/${postId}/likes/${user.uid}`);
        const likeSnap = await getDoc(likeRef);
        setLiked(likeSnap.exists());
      }
      setLoading(false);
    }, (err) => {
      setError('Erro ao carregar post');
      setLoading(false);
    });

    const commentsRef = collection(db, `posts/${postId}/comments`);
    const commentsQuery = query(commentsRef);
    const unsubscribeComments = onSnapshot(commentsQuery, async (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        let createdAt: string | null = null;
        if (data.createdAt) {
          if (typeof data.createdAt === 'string') {
            createdAt = data.createdAt;
          } else if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
            createdAt = (data.createdAt as Timestamp).toDate().toISOString();
          }
        }
        return {
          id: doc.id,
          ...data,
          createdAt,
          likedByUser: false,
        };
      }) as Comment[];

      if (user) {
        const updatedComments = await Promise.all(
          commentsData.map(async (comment) => {
            const likeRef = doc(db, `posts/${postId}/comments/${comment.id}/likes/${user.uid}`);
            const likeSnap = await getDoc(likeRef);
            return { ...comment, likedByUser: likeSnap.exists() };
          })
        );
        setComments(updatedComments);
      } else {
        setComments(commentsData);
      }
    });

    return () => {
      unsubscribePost();
      unsubscribeComments();
    };
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    if (loadingUser) return;

    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes/${user.uid}`);

    try {
      await runTransaction(db, async (transaction) => {
        if (liked) {
          transaction.delete(likeRef);
          transaction.update(postRef, { likesCount: increment(-1) });
        } else {
          transaction.set(likeRef, { likedAt: serverTimestamp() });
          transaction.update(postRef, { likesCount: increment(1) });
        }
      });
      setLiked(!liked);
      setLikesCount((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
      toast.success(liked ? 'Like removido' : 'Post curtido');
    } catch (error) {
      toast.error('Erro ao processar like');
    }
  };

  const handleAuthorClick = () => {
    if (post?.authorUID) {
      router.push(`/posts/author/${post.authorUID}`);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }
    if (!comment.trim()) {
      toast.error('O comentário não pode estar vazio');
      return;
    }
    try {
      const commentRef = doc(collection(db, `posts/${postId}/comments`));
      const postRef = doc(db, 'posts', postId);
      await setDoc(commentRef, {
        content: comment,
        authorUID: user.uid,
        authorName: user.displayName || 'Usuário',
        createdAt: serverTimestamp(),
        likesCount: 0,
      });
      await updateDoc(postRef, { commentsCount: increment(1) });
      setComment('');
      toast.success('Comentário enviado');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar comentário');
    }
  };

  const handleCommentLike = async (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    if (loadingUser) return;

    const commentRef = doc(db, `posts/${postId}/comments/${commentId}`);
    const likeRef = doc(db, `posts/${postId}/comments/${commentId}/likes/${user.uid}`);

    try {
      await runTransaction(db, async (transaction) => {
        if (isLiked) {
          transaction.delete(likeRef);
          transaction.update(commentRef, { likesCount: increment(-1) });
        } else {
          transaction.set(likeRef, { likedAt: serverTimestamp() });
          transaction.update(commentRef, { likesCount: increment(1) });
        }
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likedByUser: !isLiked, likesCount: isLiked ? c.likesCount - 1 : c.likesCount + 1 }
            : c
        )
      );
      toast.success(isLiked ? 'Like removido' : 'Comentário curtido');
    } catch (error) {
      toast.error('Erro ao processar like');
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
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!post) return null;

  return (
    <div className={styles.sectionView}>
      <div className={styles.postView}>
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
            onClick={handleLike}
            style={{ cursor: user && !loadingUser ? 'pointer' : 'not-allowed' }}
          >
            <Heart
              size={18}
              fill={liked ? 'red' : 'none'}
              color={liked ? 'red' : 'currentColor'}
            />
            {likesCount}
          </span>
          <span>
            <MessageSquare size={18} /> {commentsCount}
          </span>
          <span onClick={handleShare} style={{ cursor: user && !loadingUser ? 'pointer' : 'not-allowed' }}>
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
              size={18}
              onClick={handleCommentSubmit}
            />
          </div>
          <div className={styles.commentList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <span className={styles.commentAuthor}>{comment.authorName}</span>
                {comment.createdAt && (
                  <span className={styles.commentDate}>
                    {format(new Date(comment.createdAt), 'd MMM yyyy, HH:mm', { locale: ptBR })}
                  </span>
                )}
                <p className={styles.commentContent}>{comment.content}</p>
                <span
                  onClick={() => handleCommentLike(comment.id, comment.likedByUser)}
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