// blogfolio/src/app/layout.tsx

import type { Metadata } from 'next';
import { ThemeProvider } from './context';
import { Poppins, Inter } from 'next/font/google'; // <-- Adicione estas importações
import { DraftPostProvider } from './context/DraftPostContext';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from "@vercel/analytics/next"

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
  title: 'Blog Cristão – Inspiração e Reflexões',
  description: 'Mensagens, reflexões e artigos cristãos para inspiração espiritual. Edifique sua fé com conteúdos atualizados semanalmente.',
  metadataBase: new URL('https://blog-cristao.vercel.app'),
  openGraph: {
    title: 'Blog Cristão – Inspiração e Reflexões',
    description: 'Mensagens, reflexões e artigos cristãos para inspiração espiritual. Edifique sua fé com conteúdos atualizados semanalmente.',
    url: 'https://blog-cristao.vercel.app',
    siteName: 'Blog Cristão',
    images: ['/default-og-image.png'],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Cristão – Inspiração e Reflexões',
    description: 'Mensagens, reflexões e artigos cristãos para inspiração espiritual. Edifique sua fé com conteúdos atualizados semanalmente.',
    images: ['/default-og-image.png'],
  },
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
      <head>{/* ... (seu script de tema) */}</head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <DraftPostProvider>
              <Header />
              <main style={{ paddingTop: '60px' }}>{children}</main>
              <ToastContainer />
              <Analytics/>
            </DraftPostProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
