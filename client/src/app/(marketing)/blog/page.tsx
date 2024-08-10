"use client";

import { useEffect, useState } from "react";

import Loading from "@/app/loading";
import { Posts } from "@/components/Posts";
import { PostSearch } from "@/components/PostSearch";
import { getAllPosts } from "@/services/getPosts";
import { Post } from "@/types/Post";

// serv.Комп могут быть async
export default function Blog() {
  // сост.постов,загр.,ошб.
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // асинхр.загр.данн.
  useEffect(() => {
    getAllPosts()
      .then(setPosts)
      .catch((error) => console.error("Ошибка при загрузке постов:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="blog">
      <h1>Cтраница Блога</h1>
      <PostSearch onSearch={setPosts} />
      {loading ? <Loading /> : <Posts posts={posts} />}
    </div>
  );
}
