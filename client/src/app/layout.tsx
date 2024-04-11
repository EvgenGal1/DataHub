import type { Metadata } from "next";
import Box from "@mui/material/Box";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Box sx={{ display: "flex" }}>
          <Navbar />
          {children}
          <Footer />
        </Box>
      </body>
    </html>
  );
}
