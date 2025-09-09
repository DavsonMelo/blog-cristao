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
  const text = `Confira este post: ${post.title} - ${window.location.origin}/posts/${post.id}`;

  const shareOptions = [
    {
      name: 'Whats',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      icon: '/icons/whatsapp.svg',
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      icon: '/icons/twitter-x.svg',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        text
      )}`,
      icon: '/icons/facebook.svg',
    },
    {
      name: 'Instagram',
      url: `https://www.instagram.com/share?url=${encodeURIComponent(text)}`,
      icon: '/icons/instagram.svg',
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
              onClick={() => window.open(option.url, '_blank')}
              className={styles.option}
            >
              <img
                src={option.icon}
                alt={option.name}
                className={styles.icon}
              />
              <span> {option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
