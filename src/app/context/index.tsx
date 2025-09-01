"use client"

import { createContext, useState, useEffect, ReactNode } from "react";

type Theme = 'light' | 'dark';
type ThemeContextType = { theme: Theme; toggle: () => void; };

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) setTheme(storedTheme);
    document.documentElement.classList.add(storedTheme || 'light');
  }, []);

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

// Este código cria um seletor de tema claro/escuro usando a Context API do React. Ele gerencia o estado do tema, salva a preferência do usuário no armazenamento local do navegador e aplica a classe CSS correta ao documento HTML.

// Como Funciona
// Gerenciamento de Estado: O componente ThemeProvider usa o useState para rastrear o tema atual, que pode ser 'light' (claro) ou 'dark' (escuro).

// Tema Persistente: O hook useEffect é executado uma vez, quando o componente é montado. Ele verifica o localStorage para uma preferência de tema salva anteriormente. Se um tema for encontrado, ele é aplicado ao estado e à classe do documento HTML. Isso garante que o tema persista mesmo depois que o usuário recarregar a página.

// Funcionalidade de Alternar: A função toggle alterna o tema entre 'light' e 'dark'. Ela atualiza o estado do componente, muda a classe no elemento <html> e salva o novo tema no localStorage.

// Context API: O createContext é usado para tornar o theme e a função toggle disponíveis para qualquer componente filho envolvido pelo <ThemeProvider>. Isso evita a necessidade de passar props por várias camadas de componentes, um conceito conhecido como "prop drilling". O código exporta o ThemeContext e o ThemeProvider para serem usados em outras partes da aplicação.
