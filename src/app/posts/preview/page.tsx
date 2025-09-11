'use client'

import dynamic from 'next/dynamic';

const PreviewClient = dynamic(() => import('./PreviewClient'), { ssr: false });

export default function Page() {
  return <PreviewClient />;
}
