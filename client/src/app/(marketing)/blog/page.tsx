import { Metadata } from "next";
import Link from "next/link";

// вспомог.fn получ.данн. Отраб.на serv.
async function getDate() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    // расшир.доп.объ.настр.fetch от Next > повотр.провер.данн.кеша (здесь раз в час проверка)
    { next: { revalidate: 3600 } }
  );
  // ошб.е/и не ok
  if (!response.ok) {
    throw new Error(
      `ok: ${response?.ok}\nstatus: ${response?.status}\nsms: ${response?.statusText}\nurl: ${response?.url}`
    );
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
