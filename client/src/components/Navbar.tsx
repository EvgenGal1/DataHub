"use client";

import React from "react";
// логика,Комп.Next
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// свои компоненты
import MenuIcon from "./icons/MenuIcon";
import ChevronLeftIcon from "./icons/ChevronLeftIcon";
import ChevronRightIcon from "./icons/ChevronRightIcon";
import InboxIcon from "./icons/InboxIcon";
import CloudDownloadIcon from "./icons/CloudDownloadIcon";
import AlbumIcon from "./icons/AlbumIcon";
import AudiotrackIcon from "./icons/AudiotrackIcon";
import PlaylistPlayIcon from "./icons/PlaylistPlayIcon";
import MailIcon from "./icons/MailIcon";
import PersonIcon from "./icons/PersonIcon";
import ShoppingCartIcon from "./icons/ShoppingCartIcon";

// ^ БОКОВАЯ ПАНЕЛЬ | SIDE BAR
// масс.верх.эл/путей бок.панель
const menuVerticalTopItems = [
  { text: "Главная", href: "/" },
  { text: "Закачать", href: "/download" },
  { text: "Треки", href: "/tracks" },
  { text: "Альбомы", href: "/albums" },
  { text: "Плейлисты", href: "/playlists" },
];
// интерф./объ.соответствий иконок бок.м.
interface IconMap {
  [key: string]: JSX.Element;
}
// объ.соответствий
const iconMap: IconMap = {
  Почта: <MailIcon />,
  Корзина: <ShoppingCartIcon />,
  ЛК: <PersonIcon />,
};

export default function Navbar() {
  // сост.откр.бок.панель
  const [isOpen, setOpen] = React.useState(false);
  // хук навигации NextJS
  const router = useRouter();

  // опред.актив.ссылок > .active
  const pathname = usePathname();

  // откр.бок.панель
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  // закр.бок.панель
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* header. горизонт.меню */}
      <header className={`header ${isOpen ? "isOpen" : ""}`}>
        {/* общ.div эл.в header */}
        <div className="header-wrapper">
          {/* кнп.откр.бок.панель */}
          <button
            onClick={handleDrawerOpen}
            style={{ display: isOpen ? "none" : "flex" }}
            data-open={isOpen ? "true" : "false"}
          >
            {/* иконка откр.бок.панель */}
            <MenuIcon />
          </button>
          {/* название сайта */}
          <div className="name-site">
            <span>Центр Данных</span>
            <span>Data Hub</span>
          </div>
          {/* страницы */}
          <nav className={`nav flex ml-auto`}>
            {/* stl.a ч/з Next */}
            <Link
              href="/"
              className={`link ${pathname === "/" ? "active" : ""}`}
            >
              <span>Home</span>
            </Link>
            <Link
              href="/examples"
              className={`link ${pathname === "/examples" ? "active" : ""}`}
            >
              <span>Exempl</span>
            </Link>
            <Link
              href="/blog"
              className={`link ${pathname === "/blog" ? "active" : ""}`}
            >
              <span>Blog</span>
            </Link>
            <Link
              href="/about"
              className={`link ${
                pathname === "/about" ||
                pathname === "/about/team" ||
                pathname === "/about/contacts"
                  ? "active"
                  : ""
              }`}
            >
              <span>About</span>
            </Link>
          </nav>
        </div>
      </header>
      {/* Боковая Панель | Side Bar */}
      <div
        className={`side-bar ${isOpen ? "isOpen" : ""}`}
        data-open={isOpen ? "true" : "false"}
      >
        <div className={`side-bar-wrapper ${isOpen ? "isOpen" : ""}`}>
          {/* область выкл.бок.панели */}
          <div className="side-bar__close">
            {/* иконка закр.бок.панель */}
            <button className="side-bar-button" onClick={handleDrawerClose}>
              {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
          </div>
          {/* 1ый ul лист бок.панель */}
          <ul>
            {/* масс.эл.li */}
            {/* // ^ отрисовка ч/з встроеный масс. (запись, аудио, скачать) */}
            {/* {["Закачать", "Треки", "Альбомы", "Плейлисты"].map((text, index) => */}
            {/* // ^ отрисовка ч/з перем.масс. */}
            {/* {menuVerticalTopItems.map(({ text, href }, index) => (
              <ListItem
                key={href}
                onClick={() => router.push(href)}
                disablePadding
                sx={{ display: "block" }}
                className={`link ${pathname === href ? "active" : ""}`}
              >
                <ListItemButton
                  className="hover-el"
                  sx={{
                    minHeight: 48,
                    justifyContent: isOpen ? "initial" : "center",
                    px: 20.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isOpen ? 3 : "auto",
                      justifyContent: "center",
                      color: "black",
                    }}
                  >
                    {index === 0 ? (
                      <InboxIcon />
                    ) : index === 1 ? (
                      <CloudDownloadIcon />
                    ) : index === 2 ? (
                      <AudiotrackIcon />
                    ) : index === 3 ? (
                      <AlbumIcon />
                    ) : (
                      <PlaylistPlayIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={{ opacity: isOpen ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            ))} */}
            {menuVerticalTopItems.map(({ text, href }, index) => (
              <li
                key={href}
                onClick={() => router.push(href)}
                className={`link ${pathname === href ? "active" : ""}`}
              >
                {/* общ.div иконки/текста */}
                <div
                  className="hover-el"
                  style={{ justifyContent: isOpen ? "initial" : "center" }}
                >
                  {/* div иконки */}
                  <div style={{ marginRight: isOpen ? 24 : "auto" }}>
                    {/* svg иконки */}
                    {/* подход > 2х чёт не чёт */}
                    {/* {index % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
                    {/* подход > неск.услов.опер.index */}
                    {index === 0 ? (
                      <InboxIcon />
                    ) : index === 1 ? (
                      <CloudDownloadIcon />
                    ) : index === 2 ? (
                      <AudiotrackIcon />
                    ) : index === 3 ? (
                      <AlbumIcon />
                    ) : (
                      <PlaylistPlayIcon />
                    )}
                  </div>
                  {/* текст */}
                  <div style={{ opacity: isOpen ? 1 : 0 }}>
                    <span>{text}</span>
                  </div>
                  {/* обложка хз зачем */}
                  <span className="hz"></span>
                </div>
              </li>
            ))}
          </ul>
          <hr className="hr hr-big" />
          {/* 2ой ul лист бок.панель */}
          <ul>
            {["Почта", "Корзина", "ЛК"].map((text, index) => (
              <li key={text} style={{ display: "block" }}>
                <div
                  className="hover-el"
                  style={{ justifyContent: isOpen ? "initial" : "center" }}
                >
                  <div style={{ marginRight: isOpen ? 24 : "auto" }}>
                    {/* подход ч/з объ.соответствий */}
                    {iconMap[text]}
                  </div>
                  <div style={{ opacity: isOpen ? 1 : 0 }}>
                    <span>{text}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
