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
  title: "Music Platform",
  description: "Music Platform (stack Next Nest)",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        // url: "/images/icon-light.png",
        // href: "/images/icon-light.png",
        url: "/images/icon/favicon_MusicBase-Next.ico",
        href: "/images/icon/favicon_MusicBase-Next.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        // url: "/images/icon.png",
        // href: "/images/icon-dark.png",
        url: "/images/icon/favicon_MusicBase-upd.ico",
        href: "/images/icon/favicon_MusicBase-upd.ico",
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
