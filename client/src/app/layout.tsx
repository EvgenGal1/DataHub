import type { Metadata } from "next";
import { headers } from "next/headers";

// Компоненты
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
// доп.ф.
import metadataRu from "@/config/lang/locales/ru";
import metadataEn from "@/config/lang/locales/en";
// стили. нач.устан., готов.кл.настр., проекта
import "./globals.css";
import "../styles/styles.scss";
import "../styles/project.scss";
// googl шрифты
import { Inter } from "next/font/google";

// настр.шрифтов ч/з fn > навешивание в необходимый объ.className(здесь body)
const inter = Inter({ subsets: ["latin"] });

// объ.настр.метадаты > SEO
export let metadata: Metadata = {
  // title, description, keywords подтяг.в зависимости от языка пользователя
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/images/icon/favicon_MusicBase(light).ico",
        href: "/images/icon/favicon_MusicBase(light).ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/images/icon/favicon_MusicBase(dark).ico",
        href: "/images/icon/favicon_MusicBase(dark).ico",
      },
    ],
  },
};

// возврат fn с приёмом/использ. children
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // язык по умолч., опред.языков пользователя
  let defaultLang = "en";
  const acceptLanguage = headers().get("accept-language" /* "referer" */);
  // metadata RU логика. Взять 2 первых символа
  // const firstTwoSimbol = acceptLanguage?.substring(0, 2);
  if (/* firstTwoSimbol == "ru" */ acceptLanguage?.startsWith("ru")) {
    defaultLang = "ru";
    // добав.св-ва из metadataRu
    metadata = { ...metadata, /* title: "Хаб Данных" */ ...metadataRu };
  }
  // metadata EN логика.
  else metadata = { ...metadata, ...metadataEn };

  return (
    <html lang={defaultLang}>
      {/* <head></head> */}
      <body className={inter.className} /* data-theme="dark" */>
        {/* альтер.MUI с превикс.stl <Box sx={{ display: "flex" }}> */}
        <div className="general-container">
          <Navbar />
          {/* альтер.MUI с префикс.stl <Box component="main" sx={{ flexGrow: 1, p: 3 }} > */}
          <main className="main-my flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
