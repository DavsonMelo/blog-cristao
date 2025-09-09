// components/share_modal.tsx
'use client';

import { X } from 'lucide-react';
import styles from './styles.module.scss';
import { PostWithUser } from '@/lib/types';

interface ShareModalProps {
  post: PostWithUser;
  onClose: () => void;
}

export default function ShareModal({ post, onClose }: ShareModalProps) {
  // Garante que o post tenha ID definido
  if (!post?.id) return null;

  // URL do post já renderizado com meta tags OG no servidor
  const postUrl = `${window.location.origin}/posts/${post.id}`;

  // Texto para WhatsApp / Twitter (não altera o preview, só o texto inicial)
  const text = `Confira este post: ${post.title || 'Post'} - ${postUrl}`;
  const encodedText = encodeURIComponent(text);

  const shareOptions = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
      icon: '/icons/whatsapp.svg',
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(
        postUrl
      )}`,
      icon: '/icons/twitter-x.svg',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
      icon: '/icons/facebook.svg',
    },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          <X />
        </button>
        <h2 className={styles.title}>Compartilhar</h2>
        <div className={styles.options}>
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                window.open(option.url, '_blank');
                onClose(); // mantém o fechamento do modal
              }}
              className={styles.option}
            >
              <img src={option.icon} alt={option.name} className={styles.icon} />
              <span> {option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
