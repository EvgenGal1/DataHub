// логика работы с опред.постом по ID

import { NextResponse } from "next/server";
import { headers, cookies /* , draftMode */ } from "next/headers";
// import { redirect } from "next/navigation";

import { postsFake } from "../postsFake";

// получение. req - объ запроса со всей инфо
export async function GET(
  req: Request,
  // из 2го парам.Respons указ.точн.данн.
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // преобразование ID в число
  const postId = parseInt(id, 10);

  // поиск поста по ID
  const post = postsFake.find((post) => post.id === postId);

  // ошб.е/и поста нет
  if (!post) return NextResponse.error();

  return NextResponse.json(post);
}

// удаление
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // id(от парам.Respons),headers,cookies(от next, только чтение)
  const id = params.id;

  const headerList = headers();
  const type = headerList.get("Content-Type");

  const cookiesList = cookies();
  const cook = cookiesList.get("Cookie_1")?.value;

  // логика удаления поста

  // редирект по стр.по завершению
  // redirect("/");

  // возвращ.для проверки в Postman
  return NextResponse.json({ id, type, cook });
}
