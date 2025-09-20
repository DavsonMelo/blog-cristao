// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // todos os robôs
      allow: '/',     // pode rastrear tudo
    },
    sitemap: 'https://blog-cristao.vercel.app/sitemap.xml',
  };
}
