import type { Metadata } from "next";
import { headers } from "next/headers";

// Компоненты
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
// язык.настр.
import metadatalang from "@/config/lang/langConfig";
// стили. нач.устан., готов.кл.настр., проекта
import "./globals.css";
import "../styles/styles.scss";
import "../styles/project.scss";
// googl шрифты
import { Inter } from "next/font/google";

// настр.шрифтов ч/з fn > навешивание в объ.className(здесь body)
const inter = Inter({ subsets: ["latin"] });

// объ.настр.метадаты > SEO
export let metadata: Metadata = {
  // title,description,keywords подтяг.в завис.от языка польз.из langConfig
  icons: {
    // устан.ico от цвет.темы системы
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
  // язык по умолчанию, опред.языка пользователя из настр.браузера
  let defaultLang: "ru" | "en" = "en";
  const acceptLanguage = headers().get("accept-language");
  // измен.язык по умолчанию
  if (acceptLanguage?.startsWith("ru")) defaultLang = "ru";
  // объедин.metadata
  metadata = { ...metadata, ...metadatalang[defaultLang] };

  return (
    <html lang={defaultLang}>
      {/* <head></head> */}
      <body className={inter.className} data-theme="dark">
        <div className="general-container">
          <Navbar />
          <main className="main-my flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
