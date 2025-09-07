import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '', // Deixe vazio para usar a porta padrão (443 para HTTPS)
        pathname: '/**', // Permite qualquer caminho no domínio
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* outras opções de configuração aqui */
};

export default nextConfig;