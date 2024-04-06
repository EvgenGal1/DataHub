import Image from "next/image";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="center flex flex-col items-center justify-center p-24">
        <h1>Добро пожаловать</h1>
        <h3>Лучшие Треки</h3>
        {/* стили по Next // ! не раб.ошб. - ⨯ ./node_modules\next\dist\compiled\client-only\error.js
            'client-only' cannot be imported from a Server Component module. It should only be used from a Client Component.
            Import trace for requested module: ..... ./src\app\page.tsx */}
        {/* <style jsx>
          {`
            .center {
              margin-top: 150px
          `}
        </style> */}
      </main>
    </>
  );
}
