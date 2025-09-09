import { useState } from "react";

type Shareable = {
  id: string | number;
  title?: string;
};

export function useShare({ id, title }: Shareable) {
  const [isOpen, setIsOpen] = useState(false);

  const url = `${window.location.origin}/posts/${id}`;
  const safeTitle = title || "Confira este post";

  const shareOptions = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${safeTitle} - ${url}`)}`,
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${safeTitle} - ${url}`)}`,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(safeTitle)}`,
    },
  ];

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, "_blank");
    closeModal();
  };

  return { isOpen, openModal, closeModal, shareOptions, handleShare };
}
