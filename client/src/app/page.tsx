import About from "./about/page";
import Navbar from "../components/Navbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      {/* <main className="center flex flex-col items-center justify-center p-2">
        <h1>Добро пожаловать</h1>
        <h3>Лучшие Треки</h3>
        стили по Next // ! не раб.ошб. - ⨯ ./node_modules\next\dist\compiled\client-only\error.js
            'client-only' cannot be imported from a Server Component module. It should only be used from a Client Component.
            Import trace for requested module: ..... ./src\app\page.tsx
        <style jsx>
          {`
            .center {
              margin-top: 150px
          `}
        </style>
      </main> */}
      {/* <About/> */}
      <div>
        page--*0*1*2*3*4*5*6*7*8*9*10*11*12*13*14*15*16*17*18*19*20*--page
      </div>
      <Box component="main" sx={{ flexGrow: 2, p: 5 }}>
        {/* <DrawerHeader /> */}
        <Typography paragraph>
          Lorem очень морковь, томатный бакалавриат, но Iusmod в то время для
          работы или болезненной боли.
        </Typography>
        <Typography paragraph>
          Следует крупнейший в настоящее время паспорт, но жизнь
          занимает.Экологический к Ullamcorper не нуждается в FARISISI, даже
          диаметр футбола.
        </Typography>
      </Box>
      <div>
        page-^^-*0*1*2*3*4*5*6*7*8*9*10*11*12*13*14*15*16*17*18*19*20*-^^-page
      </div>
    </>
  );
}
