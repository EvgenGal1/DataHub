"use client";

import React from "react";
// логика,Комп.Next
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// Комп.MaterialUI
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import AlbumIcon from "@mui/icons-material/Album";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import InboxIcon from "@mui/icons-material/Inbox";
import MailIcon from "@mui/icons-material/Mail";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
// ^^ доп.иконки - https://v4.mui.com/ru/components/material-icons/
// import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
// import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

// свои компоненты
import MenuIcon from "./icons/MenuIcon";

// ^ ГОРИЗОНТАЛЬНОЕ МЕНЮ
// интерф.горизонт.меню(stl/лог.)
interface AppBarProps extends MuiAppBarProps {
  isOpen?: boolean;
}
// горизонт.меню(stl/лог.)
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "isOpen",
})<AppBarProps>(({ theme, isOpen }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isOpen && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  // ^^ свои stl
  color: "#c2c2c2",
  backgroundColor: "#252850",
}));

// ^ БОКОВАЯ ПАНЕЛЬ | SIDE BAR
// ширина бок.панель
const drawerWidth = 175;
// масс.верх.эл/путей бок.панель
const menuVerticalTopItems = [
  { text: "Главная", href: "/" },
  { text: "Закачать", href: "/download" },
  { text: "Треки", href: "/tracks" },
  { text: "Альбомы", href: "/albums" },
  { text: "Плейлисты", href: "/playlists" },
];
// бок.панель(stl/лог.)
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "isOpen",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
  // ^^ свои stl
  "& > div": { backgroundColor: "#003366" },
}));
// область/иконка закр.бок.панель
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // необходимо, чтобы контент был ниже панели приложений
  ...theme.mixins.toolbar,
}));
// stl.откр.бок.м.
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});
// stl.закр.верик.м.
const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});
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

// ^^ свои stl.
// наведение
const hoverStyle = {
  "&:hover, &:hover > div > svg": {
    color: "#f3a505",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    transition: "color 0.3s ease",
  },
};
const styles = {
  // назв.сайта
  typographyStyle: {
    fontSize: "inherit",
    fontFamily: "inherit",
    lineHeight: 1,
    ...hoverStyle,
  },
};

export default function Navbar() {
  // сост.откр.бок.панель
  const [isOpen, setOpen] = React.useState(false);
  // хук темы MUI
  const theme = useTheme();
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
            aria-label="isOpen drawer"
            style={{ display: isOpen ? "none" : "flex" }}
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
                // ? раб.ток.на первый путь
                pathname === ("/about" || "/about/team" || "/about/contacts")
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
      <Drawer variant="permanent" open={isOpen} className="side-bar">
        {/* область выкл.бок.панели */}
        <DrawerHeader className="side-bar__close">
          {/* иконка закр.бок.панель */}
          <IconButton
            className="side-bar-button close-button"
            onClick={handleDrawerClose}
            sx={{
              ...hoverStyle,
            }}
          >
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        {/* 1ый ul лист бок.панель */}
        <ul>
          {/* масс.эл.li */}
          {/* // ^ отрисовка ч/з встроеный масс. (запись, аудио, скачать) */}
          {/* {["Закачать", "Треки", "Альбомы", "Плейлисты"].map((text, index) => */}
          {/* // ^ отрисовка ч/з перем.масс. */}
          {menuVerticalTopItems.map(({ text, href }, index) => (
            // li
            <ListItem
              key={href}
              onClick={() => router.push(href)}
              disablePadding
              sx={{ display: "block" }}
              className={`link ${pathname === href ? "active" : ""}`}
            >
              {/* общ.div иконки/текста */}
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: isOpen ? "initial" : "center",
                  px: 2.5,
                  ...hoverStyle,
                }}
              >
                {/* div иконки */}
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isOpen ? 3 : "auto",
                    justifyContent: "center",
                    color: "black",
                  }}
                >
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
                </ListItemIcon>
                {/* текст */}
                <ListItemText primary={text} sx={{ opacity: isOpen ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </ul>
        {/* Divider черта в MUI */}
        <hr
          className="hr" /* data-size="big" */
          // врем.css
          style={{
            // borderWidth: "var(--sz3)",
            borderWidth: "32px",
          }}
        />
        {/* 2ой ul лист бок.панель */}
        <ul>
          {["Почта", "Корзина", "ЛК"].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  ...hoverStyle,
                  minHeight: 48,
                  justifyContent: isOpen ? "initial" : "center",
                  px: 2.5,
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
                  {/* подход ч/з объ.соответствий */}
                  {iconMap[text]}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: isOpen ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </ul>
      </Drawer>
    </>
  );
}
