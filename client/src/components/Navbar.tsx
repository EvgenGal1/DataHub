"use client";

import React from "react";

// свои компоненты
import Header from "./Header";
import Sidebar from "./Sidebar";

// const Navbar: React.FC = () => {
export default function Navbar() {
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
      <Header isOpen={isOpen} handleDrawerOpen={handleDrawerOpen} />
      {/* боковая панель. кнп.переключ/навигация  */}
      <Sidebar isOpen={isOpen} handleDrawerClose={handleDrawerClose} />
    </>
  );
}
