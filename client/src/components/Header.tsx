"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import MenuIcon from "./icons/MenuIcon";

// названия/пути/эл. пунктов шапки
const navItems = [
  { text: "Home", href: "/" },
  { text: "Examples", href: "/examples" },
  { text: "Blog", href: "/blog" },
  { text: "About", href: "/about" },
];

const Header: React.FC<{ isOpen: boolean; handleDrawerOpen: () => void }> = ({
  isOpen,
  handleDrawerOpen,
}) => {
  const pathname = usePathname();

  return (
    <header className={`header ${isOpen ? "isOpen" : ""}`}>
      <div className="header-wrapper">
        <button
          onClick={handleDrawerOpen}
          style={{ display: isOpen ? "none" : "flex" }}
          data-open={isOpen ? "true" : "false"}
        >
          <MenuIcon />
        </button>
        <div className="name-site">
          <span>Центр Данных</span>
          <span>Data Hub</span>
        </div>
        <nav className="nav flex ml-auto">
          {navItems.map(({ text, href }) => (
            <Link
              key={href}
              href={href}
              className={`link ${pathname === href ? "active" : ""}`}
            >
              <span>{text}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
