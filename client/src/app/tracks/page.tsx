import { Metadata } from "next";

// локал.объ.настр.метадаты > SEO
export const metadata: Metadata = {
  title: "Треки | Музыкальная Платформа",
  description: "Список треков",
  keywords: "track, tracks, треки, трек",
  icons: "/images/icon/favicon_MusicBase(light).ico",
};

// serv.Комп могут быть async
export default async function Tracks() {
  return (
    <div className="tracks">
      <h1>Tracks</h1>
      <p>Список треков</p>
    </div>
  );
}
