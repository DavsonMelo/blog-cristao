'use client'; // Diz ao Next.js que esse componente roda no lado do cliente (browser)

import { createContext, useContext, useState, ReactNode } from 'react'; 
// Importa funções e tipos do React:
// - createContext: cria um contexto
// - useContext: consome um contexto
// - useState: gerencia estado interno
// - ReactNode: tipo para qualquer elemento React (JSX, string, etc)

interface DraftPost {
  title: string;          // título do post
  content: string;        // conteúdo do post
  imageFile?: File;       // arquivo de imagem opcional
  previewUrl?: string;    // URL de preview opcional da imagem
  authorUID: string;      // ID único do autor (obrigatório)
  authorName: string;
  authorEmail: string;    // e-mail do autor (obrigatório)
  authorPhoto?: string;   // foto do autor (opcional)
}

interface DraftPostContextType {
  draft: DraftPost | null;                          // estado do rascunho (ou null)
  setDraft: (draft: DraftPost | null) => void;      // função para atualizar o rascunho
}

const DraftPostContext = createContext<DraftPostContextType | undefined>(
  undefined // valor inicial é undefined até que o Provider defina
);

export const DraftPostProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<DraftPost | null>(null); 
  // Estado local do Provider, começa como null

  return (
    // Torna o estado `draft` e a função `setDraft` disponíveis para todos os filhos
    <DraftPostContext.Provider value={{ draft, setDraft }}>
      {children}
    </DraftPostContext.Provider>
  );
};

export const useDraftPost = () => {
  const context = useContext(DraftPostContext); // consome o contexto
  if (!context)
    // se não estiver dentro de um Provider, lança erro
    throw new Error('useDraftPost must be used within a DraftPostProvider');
  return context; // retorna { draft, setDraft }
};
