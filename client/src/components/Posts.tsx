import Link from "next/link";

import { PostType } from "@/types/PostType";
import type { PostsType as PostsType } from "@/types/PostsType";

const Posts = ({ posts }: PostsType) => {
  return (
    <ul>
      {posts.map((post: PostType) => (
        <li key={post.id}>
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
};

export { Posts };
