// blogfolio/src/app/layout.tsx

import type { Metadata } from 'next';
import { ThemeProvider } from './context';
import { Poppins, Inter } from 'next/font/google'; // <-- Adicione estas importações
import { DraftPostProvider } from './context/DraftPostContext';
import { AuthProvider } from "./context/auth";

import './globals.scss';
import Header from './components/header';
import { ToastContainer } from 'react-toastify';

// <-- Defina as variáveis de fonte novamente
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
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable}`}
    >
      <head>
        {/* ... (seu script de tema) */}
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <DraftPostProvider>
              <Header />
              <main style={{ paddingTop: '60px' }}>
                {children}
              </main>
              <ToastContainer />
            </DraftPostProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}