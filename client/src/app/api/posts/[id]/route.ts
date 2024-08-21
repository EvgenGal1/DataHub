// логика работы с опред.постом по ID

import { NextResponse } from "next/server";
// import { headers, cookies /* , draftMode */ } from "next/headers";
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
  // id(парам.Respons),headers,cookies(next )
  const id = params.id;

  // логика удаления поста

  // редирект по стр.по завершению
  // redirect("/");

  return NextResponse.json({ id });
}
