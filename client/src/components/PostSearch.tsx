"use client";

import { FormEventHandler, useEffect, useState } from "react";

import { getPostsBySearch } from "@/services/getPosts";
import { PostType } from "@/types/PostType";

type Props = { onSearch: (value: PostType[]) => void };

const PostSearch = ({ onSearch }: Props) => {
  // сост. поиск/чек.мгновенно
  const [search, setSearch] = useState<string>("");
  const [instant, setInstant] = useState<boolean>(true);

  useEffect(() => {
    // загр.посты е/и поиск пуст || "мгновенно"
    const searchPosts = async () => {
      if (search === "") {
        const allPosts = await getPostsBySearch("");
        onSearch(allPosts);
      } else if (instant) {
        const posts = await getPostsBySearch(search);
        onSearch(posts);
      }
    };

    searchPosts();
  }, [search, instant, onSearch]);

  // поиск без "мгновенно"
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!instant) {
      const posts = await getPostsBySearch(search);
      onSearch(posts);
    }
  };

  return (
    <form className="df df-aic df-jcc m-3" onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="inpt"
      />
      <button className="btn btn-primary ml3 ml-3" type="submit">
        Поиск
      </button>
      <label className="ml-3">
        <input
          type="checkbox"
          checked={instant}
          onChange={() => setInstant(!instant)}
          className="mr-1"
        />
        Мгновенно
      </label>
    </form>
  );
};

export { PostSearch };
