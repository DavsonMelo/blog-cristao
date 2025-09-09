'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from '../share_modal'; // (depois criamos o ShareModal separado)
import { PostWithUser } from "@/lib/types";

export default function ShareButton({post}: {post: PostWithUser}) {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <Share2 size={18} />
      </button>

      {open && <ShareModal onClose={handleClose} post={post} />}
    </>
  );
}
