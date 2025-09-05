'use client';

import { useEffect, useRef } from 'react';

export function useAutoSave<T>(data: T, key: string, delay: number = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  useEffect(() => {
    // Converter dados atual para string para comparação
    const currentDataString = JSON.stringify(data);
    
    // Só salva se os dados mudaram
    if (currentDataString !== previousDataRef.current) {
      previousDataRef.current = currentDataString;
      
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Novo timeout para salvar
      timeoutRef.current = setTimeout(() => {
        try {
          if (data && Object.keys(data as any).length > 0) {
            localStorage.setItem(key, currentDataString);
            console.log(`Auto-save realizado para: ${key}`);
          }
        } catch (error) {
          console.error('Erro no auto-save:', error);
        }
      }, delay);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [data, key, delay]);

  // Função para carregar dados salvos
  const loadSavedData = (): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
      return null;
    }
  };

  // Função para limpar dados salvos
  const clearSavedData = (): void => {
    try {
      localStorage.removeItem(key);
      console.log(`Dados removidos: ${key}`);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  };

  return { loadSavedData, clearSavedData };
}