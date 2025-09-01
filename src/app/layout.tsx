import type { Metadata } from 'next';
import { ThemeProvider } from './context';
import { Poppins, Inter } from 'next/font/google';
import { DraftPostProvider } from './context/DraftPostContext';

import './globals.scss';
import Header from './components/header';

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
        <ThemeProvider>
          <DraftPostProvider>
            <Header />
            <main style={{ paddingTop: '60px' }}>{children}</main>
          </DraftPostProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
