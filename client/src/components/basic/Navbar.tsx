// ссылки шапки

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, /* signIn, */ signOut } from "next-auth/react";

// названия/пути/эл. пунктов шапки
const navItems = [
  { text: "Home", href: "/" },
  { text: "Examples", href: "/examples" },
  { text: "Blog", href: "/blog" },
  { text: "About", href: "/about" },
];

// const Navbar: React.FC = () => {
export default function Navbar() {
  // получ.текущее место URL
  const pathname = usePathname();
  // получ.зарегистр.данн.польз.сессии ! use clt
  const session = useSession();

  return (
    <nav className="nav flex ml-auto">
      {/* базовые ссылки */}
      {navItems.map(({ text, href }) => (
        <Link
          key={href}
          href={href}
          // .active на всё кроме глав.стр.
          className={`link ${
            pathname === href || (pathname.startsWith(href) && href !== "/")
              ? "active"
              : ""
          }`}
        >
          <span>{text}</span>
        </Link>
      ))}
      {/* Профиль при сессии */}
      {session?.data && (
        <Link href="/profile" className="link">
          Profile
        </Link>
      )}
      {/* вход/выход при сессии */}
      {session?.data ? (
        // выход с редирект на гл.по клиик
        <Link
          href="#"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="link"
        >
          Sign Out
        </Link>
      ) : (
        // вход по стандарт.URL
        <Link href="/api/auth/signin" className="link">
          Sign In
        </Link>
      )}
    </nav>
  );
}
