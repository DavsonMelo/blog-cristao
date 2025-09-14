// app/components/post_card/index.tsx

import PostCardClient from "./PostCardClient";
import type { PostWithUser } from "@/lib/types";

interface PostCardProps {
  post: PostWithUser;
}

// Server Component puro — só passa dados para o client
export default function PostCard({ post }: PostCardProps) {
  return <PostCardClient post={post} />;
}
