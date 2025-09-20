import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blog-cristao.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
    },
    // Opcional: mapear seus posts
  ];
}
