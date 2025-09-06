'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DraftPost {
  title: string;
  content: string;
  imageFile?: File;
  previewUrl?: string;
  authorUID: string;      // torna obrigatório
  authorEmail: string;    // torna obrigatório
  authorPhoto?: string; 
}

interface DraftPostContextType {
  draft: DraftPost | null;
  setDraft: (draft: DraftPost | null) => void;
}

const DraftPostContext = createContext<DraftPostContextType | undefined>(
  undefined
);

export const DraftPostProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<DraftPost | null>(null);

  return (
    <DraftPostContext.Provider value={{ draft, setDraft }}>
      {children}
    </DraftPostContext.Provider>
  );
};

export const useDraftPost = () => {
  const context = useContext(DraftPostContext);
  if (!context)
    throw new Error('useDraftPost must be used within a DraftPostProvider');
  return context;
};
