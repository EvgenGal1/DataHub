import Link from "next/link";
import { usePathname } from "next/navigation";

// названия/пути/эл. пунктов шапки
const navItems = [
  { text: "Home", href: "/" },
  { text: "Examples", href: "/examples" },
  { text: "Blog", href: "/blog" },
  { text: "About", href: "/about" },
];

// const Navbar: React.FC = () => {
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav flex ml-auto">
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
    </nav>
  );
}
