'use client';
// libs externas
import { useState } from 'react';
import { LogIn } from "lucide-react";
// libs e codigos internos
import AuthModal from "../auth_modal";

export default function LoginButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
        <LogIn />
      </button>
      {open && <AuthModal onClose={() => setOpen(false)}/>}
    </>
  );
}

// Este componente React, chamado LoginButton, é responsável por exibir um botão que, quando clicado, abre um modal de autenticação. Ele é usado para gerenciar a interface de login de forma isolada e reutilizável.

// Funcionalidades Principais
// Gerenciamento do Modal: O componente usa o estado open para controlar se o modal de autenticação (AuthModal) está visível ou não. Quando o botão é clicado, setOpen(true) abre o modal.

// Acesso ao Contexto do Tema: Ele acessa o ThemeContext para obter o tema atual (theme) e a função toggle para alternar o tema. Embora o toggle não seja usado diretamente no botão, o theme pode ser usado para aplicar estilos dinamicamente. Os estilos em linha (style={{...}}) já usam variáveis CSS que, por sua vez, são controladas pelo contexto do tema.

// Componentes Reutilizáveis: O botão utiliza o ícone LogIn da biblioteca lucide-react e o componente AuthModal (importado de outro arquivo) para a lógica de autenticação.

// Lógica de Renderização Condicional: O modal de autenticação (AuthModal) só é renderizado se a variável de estado open for true, o que evita que o modal seja carregado e ocupe recursos quando não está visível. Ele também recebe uma função onClose que, quando chamada, altera o estado open para false, fechando o modal.
