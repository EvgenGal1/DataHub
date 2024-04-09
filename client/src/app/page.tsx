import Image from "next/image";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="center flex flex-col items-center justify-center p-24">
        <h1>Добро пожаловать</h1>
        <h3>Лучшие Треки</h3>
      </main>
    </>
  );
}
