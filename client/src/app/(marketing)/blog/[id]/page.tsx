// динамич.стр.с парам.

import { Metadata } from "next";

// вспомог.fn получ.данн с парам.id. Отраб.на serv.
async function getDate(id: string) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    { next: { revalidate: 3600 } }
  );
  if (!response.ok) {
    throw new Error("Пост не получен!");
  }
  return response.json();
}

// тип парам.
type Props = { params: { /* по назв.[п.] */ id: string } };
// fn.настр.метадаты > SEO + настр.асинхр.отраж.данн.
export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const post = await getDate(id);
  return { title: post.title };
}

export default async function Post({ params: { id } }: Props) {
  // асинхр.загр.данн.
  const post = await getDate(id);
  return (
    <div className="post">
      <h1>Post page {id}</h1>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  );
}
