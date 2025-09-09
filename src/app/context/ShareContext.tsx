// context/ShareContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ShareModal from '@/app/components/share_modal';
import { PostWithUser, User } from '@/lib/types';

interface ShareContextType {
  openShare: (post: PostWithUser) => void;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export function ShareProvider({ children }: { children: ReactNode }) {
  const [post, setPost] = useState<PostWithUser | null>(null);

  const openShare = (post: PostWithUser) => setPost(post);
  const closeShare = () => setPost(null);

  return (
    <ShareContext.Provider value={{ openShare }}>
      {children}
      {post && <ShareModal post={post} onClose={closeShare} />}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error('useShare deve estar dentro de <ShareProvider>');
  return ctx;
}
