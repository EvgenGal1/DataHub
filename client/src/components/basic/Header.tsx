"use client";

import React from "react";

// свои компоненты
import Headerbar from "./Headerbar";
import Sidebar from "./Sidebar";

// export default function Header() {
const Header: React.FC = () => {
  // сост.откр.бок.панель
  const [isOpen, setOpen] = React.useState(false);

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
      {/* header. кнп.переключ/лого/навигация  */}
      <Headerbar isOpen={isOpen} handleDrawerOpen={handleDrawerOpen} />
      {/* боковая панель. кнп.переключ/навигация  */}
      <Sidebar isOpen={isOpen} handleDrawerClose={handleDrawerClose} />
    </>
  );
};

export default Header;
