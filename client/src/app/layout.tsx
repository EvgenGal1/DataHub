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
  title: "Music-Platform",
  description: "Music-Platform(Next_Nest)",
};

// возврат fn с приёмом/использ. children
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
