import type { Metadata } from 'next';
import { ThemeProvider } from './context';
import { Poppins, Inter } from 'next/font/google';
import { DraftPostProvider } from './context/DraftPostContext';

import './globals.scss';
import Header from './components/header';
import { ToastContainer } from "react-toastify";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Meu Blogfólio',
  description: 'Portfólio + Blog em Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" 
    suppressHydrationWarning
    className={`${poppins.variable} ${inter.variable}`}>
      <head>
        {/* Script para evitar o flash de tema errado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storedTheme = localStorage.getItem('theme');
                const theme = storedTheme || 'light';
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body>
         <ThemeProvider>{/* providencia o tema escolhido pelo usuario e armazena as mudanças */}
          <DraftPostProvider>{/* Esse código implementa um Context API no React para gerenciar o estado de um rascunho de post (com título, conteúdo, autor etc.). */}
            <Header />{/* header da aplicação. Vai em todas as pages */}
            <main
             style={{ paddingTop: '60px' }}> 
              {children}
              <ToastContainer />
              </main>
          </DraftPostProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
