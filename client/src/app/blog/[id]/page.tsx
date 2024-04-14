// динамич.стр.с парам.

import { Metadata } from "next";

// тип парам.
type Props = { params: { /* по назв.[п.] */ id: string } };

// fn.настр.метадаты > SEO
export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  return { title: id };
}

export default function Post({ params: { id } }: Props) {
  return <div>Post page {id}</div>;
}
