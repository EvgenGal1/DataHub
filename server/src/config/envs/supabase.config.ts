import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default (): TypeOrmModuleOptions => ({
  type: 'postgres',
  synchronize: process.env.NODE_ENV !== 'production',
  entities: ['src/**/entities/*.entity{.ts}'],
  host: process.env.SUPABASE_PG_HOST,
  port: /* + */ Number(process.env.SUPABASE_PG_PORT),
  database: process.env.SUPABASE_PG_DBN,
  username: process.env.SUPABASE_PG_USER,
  password: process.env.SUPABASE_PG_PSW,
});
