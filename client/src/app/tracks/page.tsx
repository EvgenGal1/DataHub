import { Metadata } from "next";

// локал.объ.настр.метадаты > SEO
export const metadata: Metadata = {
  title: "Data Hub | Music Platform | Track",
  description: "List of tracks",
  keywords: "track, tracks, треки, трек",
};

// serv.Комп могут быть async
export default async function Tracks() {
  return (
    <div className="tracks">
      <h1>Tracks</h1>
      <p>Список треков</p>
      <div>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat alias
        corrupti recusandae voluptas ex, voluptatem sequi iste vitae sapiente
        architecto perferendis. Dolore rem laudantium qui facere dolorum,
        aliquam reprehenderit, dolorem quibusdam voluptas tenetur exercitationem
        nisi minus perferendis porro, eligendi iste repudiandae. Quas cupiditate
        sapiente ut nihil laborum minus ex exercitationem, ad eaque, consequatur
        quibusdam quam dolorem rem! In adipisci atque dolores inventore.
      </div>
      <div>====================================================</div>
    </div>
  );
}

// // UlbiTV ----------------------------------------------------------------------------------
// import React from "react";
// import MainLayout from "../../layouts/MainLayout";
// import { Box, Button, Card, Grid } from "@material-ui/core";
// import { useRouter } from "next/router";
// import { ITrack } from "../../types/track";
// import TrackList from "../../components/TrackList";
// import Player from "../../components/Player";
// import { useTypedSelector } from "../../hooks/useTypedSelector";
// import { useActions } from "../../hooks/useActions";
// import { NextThunkDispatch, wrapper } from "../../store";
// import { fetchTracks } from "../../store/actions-creators/track";

// const Index = () => {
//   const router = useRouter();
//   const { tracks, error } = useTypedSelector((state) => state.track);

//   if (error) {
//     return (
//       <MainLayout>
//         <h1>{error}</h1>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout title={"Список треков - музыкальная площадка"}>
//       <Grid container justifyContent="center">
//         <Card style={{ width: 900 }}>
//           <Box p={3}>
//             <Grid container justifyContent="space-between">
//               <h1>Список треков</h1>
//               <Button onClick={() => router.push("/tracks/create")}>
//                 Загрузить
//               </Button>
//             </Grid>
//           </Box>
//           <TrackList tracks={tracks} />
//         </Card>
//       </Grid>
//     </MainLayout>
//   );
// };

// export default Index;

// export const getServerSideProps = wrapper.getServerSideProps(
//   async ({ store }) => {
//     const dispatch = store.dispatch as NextThunkDispatch;
//     await dispatch(await fetchTracks());
//   }
// );

// // БОТ ----------------------------------------------------------------------------------
// import React, { useEffect } from 'react';
// import MainLayout from "../../layouts/MainLayout";
// import { Box, Button, Card, Grid } from "@material-ui/core";
// import { useRouter } from "next/router";
// import TrackList from "../../components/TrackList";
// import { useTypedSelector } from "../../hooks/useTypedSelector";
// import { useActions } from "../../hooks/useActions";
// import { wrapper } from "../../store";
// import { fetchTracks } from "../../store/actions-creators/track";

// const Index = () => {
//   const router = useRouter();
//   const { tracks, error } = useTypedSelector(state => state.track);
//   const { fetchTracks } = useActions();

//   useEffect(() => {
//     fetchTracks();
//   }, []);

//   if (error) {
//     return <MainLayout>
//       <h1>{error}</h1>
//     </MainLayout>;
//   }

//   return (
//     <MainLayout title={"Список треков - музыкальная площадка"}>
//       <Grid container justifyContent='center'>
//         <Card style={{ width: 900 }}>
//           <Box p={3}>
//             <Grid container justifyContent='space-between'>
//               <h1>Список треков</h1>
//               <Button onClick={() => router.push('/tracks/create')}>
//                 Загрузить
//               </Button>
//             </Grid>
//           </Box>
//           <TrackList tracks={tracks} />
//         </Card>
//       </Grid>
//     </MainLayout>
//   );
// };

// export const getServerSideProps = wrapper.getServerSideProps(async ({ store }) => {
//   await store.dispatch(fetchTracks());
// });

// export default Index;
