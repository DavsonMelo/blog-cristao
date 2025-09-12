import dynamic from 'next/dynamic';
import type { PostListClientProps } from './PostListClient';

const PostListClient = dynamic(() => import('./PostListClient'), { ssr: false });

export default function PostList(props: PostListClientProps) {
  return <PostListClient {...props} />;
}
