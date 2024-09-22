// динамич.стр.с парам.

import { Metadata } from "next";

// вспомог.fn получ.данн с парам.id. Отраб.на serv.
async function getDate(id: string) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_URL_PROD
      : process.env.NEXT_URL_DEV;

  const response = await fetch(
    // ^ общ.доступные url
    // `https://jsonplaceholder.typicode.com/posts/${id}`,
    // ^ статич.данн.фейк БД
    `${baseUrl}/api/posts/${id}`,
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
      <h1>Страница Поста № {id}</h1>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  );
}
