import type { Metadata } from "next";

// Компоненты
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
// стили
import "./globals.css";
// googl шрифты
import { Inter } from "next/font/google";

// настр.шрифтов ч/з fn > навешивание в необходимый объ.className(здесь body)
const inter = Inter({ subsets: ["latin"] });

// объ.настр.метадаты > SEO
export const metadata: Metadata = {
  title: "Data Hub",
  description: "Data Hub (FullStack App Next Nest)",
  keywords: "Data Hub, DataHub, track, tracks, треки, трек",
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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <head>
        <link rel="icon" href="/favicon.ico" />
      </head> */}
      <body className={inter.className}>
        {/* альтер.MUI с превикс.stl <Box sx={{ display: "flex" }}> */}
        <div className="general-container">
          <Navbar />
          {/* альтер.MUI с превикс.stl <Box component="main" sx={{ flexGrow: 1, p: 3 }} > */}
          <main className="main-my flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
