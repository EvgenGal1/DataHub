"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

import ChevronLeftIcon from "./icons/ChevronLeftIcon";
import ChevronRightIcon from "./icons/ChevronRightIcon";
import AlbumIcon from "./icons/AlbumIcon";
import AudiotrackIcon from "./icons/AudiotrackIcon";
import CloudDownloadIcon from "./icons/CloudDownloadIcon";
import InboxIcon from "./icons/InboxIcon";
import PlaylistPlayIcon from "./icons/PlaylistPlayIcon";
import MailIcon from "./icons/MailIcon";
import ShoppingCartIcon from "./icons/ShoppingCartIcon";
import PersonIcon from "./icons/PersonIcon";

// названия/пути/эл. пунктов боковой панели верх/низ
const sideBarTopItems = [
  { text: "Главная", href: "/", elm: <InboxIcon /> },
  { text: "Закачать", href: "/download", elm: <CloudDownloadIcon /> },
  { text: "Треки", href: "/tracks", elm: <AudiotrackIcon /> },
  { text: "Альбомы", href: "/albums", elm: <AlbumIcon /> },
  { text: "Плейлисты", href: "/playlists", elm: <PlaylistPlayIcon /> },
];
const sideBarBottomItems = [
  { text: "Почта", href: "/mail", elm: <MailIcon /> },
  { text: "Корзина", href: "/basket", elm: <ShoppingCartIcon /> },
  { text: "Личный Кабинет", href: "/personal", elm: <PersonIcon /> },
];

const Sidebar: React.FC<{ isOpen: boolean; handleDrawerClose: () => void }> = ({
  isOpen,
  handleDrawerClose,
}) => {
  // хук навигации NextJS
  const router = useRouter();
  // опред.актив.ссылок > .active
  const pathname = usePathname();

  return (
    <div className={`side-bar ${isOpen ? "isOpen" : ""}`}>
      <div className="side-bar-wrapper">
        <div className="side-bar__close">
          <button className="side-bar-button" onClick={handleDrawerClose}>
            {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>
        </div>
        <ul>
          {sideBarTopItems.map(({ text, href, elm }) => (
            <li
              key={href}
              onClick={() => router.push(href)}
              className={`link ${pathname === href ? "active" : ""}`}
            >
              <div
                className="hover-el"
                style={{ justifyContent: isOpen ? "initial" : "center" }}
              >
                <div style={{ marginRight: isOpen ? 24 : "auto" }}>{elm}</div>
                <div style={{ opacity: isOpen ? 1 : 0 }}>
                  <span>{text}</span>
                </div>
                <span className="hz"></span>
              </div>
            </li>
          ))}
        </ul>
        <hr className="hr hr-big" />
        <ul>
          {sideBarBottomItems.map(({ text, href, elm }) => (
            <li
              key={href}
              onClick={() => router.push(href)}
              className={`link ${pathname === href ? "active" : ""}`}
            >
              <div
                className="hover-el"
                style={{ justifyContent: isOpen ? "initial" : "center" }}
              >
                <div style={{ marginRight: isOpen ? 24 : "auto" }}>{elm}</div>
                <div style={{ opacity: isOpen ? 1 : 0 }}>
                  <span>{text}</span>
                </div>
                <span className="hz"></span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
