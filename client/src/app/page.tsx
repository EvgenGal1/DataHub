"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export default function Home() {
  return (
    <>
      <hr />
      <Typography paragraph>
        Lorem очень морковь, томатный бакалавриат, но Iusmod в то время для
        работы или болезненной боли.
      </Typography>
      <Typography paragraph>
        Следует крупнейший в настоящее время паспорт, но жизнь
        занимает.Экологический к Ullamcorper не нуждается в FARISISI, даже
        диаметр футбола.
      </Typography>
      <hr />
      <p>Заголовок ящика</p>
      <DrawerHeader />
      <hr />
    </>
  );
}
