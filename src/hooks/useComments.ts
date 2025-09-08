import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import { User } from "@/lib/types";

interface Comment {
  id: string;
  content: string;
  authorUID: string;
  authorName: string;
  createdAt: string | null;
  likesCount: number;
  likedByUser: boolean;
}

export function useComments(postId: string, user: User | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar comentários em tempo real
  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, `posts/${postId}/comments`);
    const q = query(commentsRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdAt: string | null = null;

        if (data.createdAt) {
          if (typeof data.createdAt === "string") {
            createdAt = data.createdAt;
          } else if (
            typeof data.createdAt === "object" &&
            "toDate" in data.createdAt
          ) {
            createdAt = (data.createdAt as Timestamp).toDate().toISOString();
          }
        }

        return {
          id: docSnap.id,
          ...data,
          createdAt,
          likedByUser: false,
        };
      }) as Comment[];

      if (user) {
        const updated = await Promise.all(
          commentsData.map(async (comment) => {
            const likeRef = doc(
              db,
              `posts/${postId}/comments/${comment.id}/likes/${user.uid}`
            );
            const likeSnap = await getDoc(likeRef);
            return { ...comment, likedByUser: likeSnap.exists() };
          })
        );
        setComments(updated);
      } else {
        setComments(commentsData);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId, user]);

  // Curtir/descurtir comentário
  const toggleCommentLike = async (commentId: string, isLiked: boolean) => {
    if (!user) return;

    const commentRef = doc(db, `posts/${postId}/comments/${commentId}`);
    const likeRef = doc(
      db,
      `posts/${postId}/comments/${commentId}/likes/${user.uid}`
    );

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
          ? {
              ...c,
              likedByUser: !isLiked,
              likesCount: isLiked ? c.likesCount - 1 : c.likesCount + 1,
            }
          : c
      )
    );
  };

  // Criar comentário
  const addComment = async (content: string) => {
    if (!user) throw new Error("Você precisa estar logado");

    const commentRef = doc(collection(db, `posts/${postId}/comments`));
    const postRef = doc(db, "posts", postId);

    await setDoc(commentRef, {
      content,
      authorUID: user.uid,
      authorName: user.name || "Usuário",
      createdAt: serverTimestamp(),
      likesCount: 0,
    });

    await updateDoc(postRef, { commentsCount: increment(1) });
  };

  return { comments, loading, toggleCommentLike, addComment };
}
