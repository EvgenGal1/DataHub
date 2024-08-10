import Link from "next/link";

import { Post } from "@/types/Post";
import type { Posts as PostsType } from "@/types/Posts";

const Posts = ({ posts }: PostsType) => {
  return (
    <ul>
      {posts.map((post: Post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
};

export { Posts };
