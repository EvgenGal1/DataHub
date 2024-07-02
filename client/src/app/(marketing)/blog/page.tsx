import { Metadata } from "next";
import Link from "next/link";

// вспомог.fn получ.данн.(без exp). Отраб.на serv,
async function getDate() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    // расшир.доп.объ.настр.fetch от Next > повотр.провер.данн.кеша (здесь раз в 60 сек.проверка)
    { next: { revalidate: 60 } }
  );
  if (!response.ok) {
    throw new Error("Невозможно получить посты!");
  }
  return response.json();
}

// локал.объ.настр.метадаты > SEO
export const metadata: Metadata = {
  title: "Data Hub | Blog",
};

// serv.Комп могут быть async
export default async function Blog() {
  // асинхр.загр.данн.
  const posts = await getDate();
  return (
    <div className="blog">
      <h1>Blog page Blog</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>
            <Link href={`/blog/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
