import { NextResponse } from "next/server";

import { postsFake } from "../postsFake";

// поиск. GET с query парам. req - объ запроса со всей инфо
export async function GET(req: Request) {
  // парам.запроса из объ.URL
  const { searchParams } = new URL(req.url);
  // значен.парам "q" (любое назв.,но принято "q")
  const query = searchParams.get("q");
  // фейк посты за место данн.БД
  let currentPosts = postsFake;
  // фильтр фейков с title по значению
  if (query)
    currentPosts = postsFake.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase())
    );
  return NextResponse.json(currentPosts);
}
