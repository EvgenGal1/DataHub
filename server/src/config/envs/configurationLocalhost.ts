export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
});

// бот 1
// import { registerAs } from '@nestjs/config';
// export default registerAs('supabase', () => ({
//   url: process.env.SUPABASE_URL,
//   key: process.env.SUPABASE_KEY,
// }));

// док
// export default () => ({
//   port: parseInt(process.env.PORT, 10) || 3000,
//   database: {
//     host: process.env.DATABASE_HOST,
//     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
//   },
// });
