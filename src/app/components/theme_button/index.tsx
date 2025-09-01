'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/app/context';
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const { theme, toggle } = useContext(ThemeContext)!;

  return (
    <button
      onClick={toggle}
      style={{
        width: '40px',
        height: '30px',
        borderRadius: '8px',
        background: 'transparent',
        color: 'var(--tex-color)',
        border: '1px solid rgba(var(--text-color-rgb), 0.2)',
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? <Sun/> : <Moon/>}
    </button>
  );
}
