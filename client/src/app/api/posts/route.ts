// API эндпойнты

import { NextResponse } from "next/server";

// данн.фейк Постов
import { postsFake } from "../../../data/postsFake";

// назв.fn() по мтд.CRUD
export async function GET() {
  // тест.баз.пример Postman с возвратом данн.на CLT
  return NextResponse.json(/* { message: "CLT NextJS" } */ postsFake);
}

// получение данн. req - объ запроса со всей инфо
export async function POST(req: Request) {
  // сохр./парсим.в json
  const body = await req.json();
  // ^ отраб.SRV
  console.log("body ", body);
  // возврат на CLT
  return NextResponse.json({ body });
}
