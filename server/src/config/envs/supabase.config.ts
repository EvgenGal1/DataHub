import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { createClient } from '@supabase/supabase-js';

import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { UserRolesEntity } from 'src/roles/entities/user-roles.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';
import { AlbumEntity } from 'src/albums/entities/album.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';

// const supabase = createClient(process.env.SB_PG_URL, process.env.SB_PG_KEY);

export default (): TypeOrmModuleOptions =>
  //
  // {
  // const supabaseUrl = process.env.SB_PG_URL;
  // console.log('supabaseUrl : ', supabaseUrl);
  // const supabaseKey = process.env.SB_PG_KEY;
  // console.log('supabaseKey : ', supabaseKey);
  // const supabase = createClient(supabaseUrl, supabaseKey);
  // console.log('supabase : ', supabase);
  /* return */ ({
    // url: process.env.SB_PG_URL,
    // key: process.env.SB_PG_KEY,
    name: 'supabase',
    type: 'postgres',
    host: process.env.SB_PG_HOST,
    // host: supabase.postgres.config.host,
    port: /* + */ Number(process.env.SB_PG_PORT),
    database: process.env.SB_PG_DBN,
    username: process.env.SB_PG_USER,
    password: process.env.SB_PG_PSW,
    // entities: [
    //   UserEntity,
    //   RoleEntity,
    //   UserRolesEntity,
    //   FileEntity,
    //   TrackEntity,
    //   AlbumEntity,
    //   ReactionEntity,
    //   // ! не отраб.подкл.по пути - постояный сбор query: SELECT * FROM current_schema() | ошб.в swg - "statusCode": 500, "message": "Internal server error
    //   // `../../*/entities/*.entity.ts`, `src/*/entities/*.entity{.ts,.js}`, `src/**/*.entity.ts`, `*/entities/**.entity{.ts}`, path.join(__dirname, 'src', '**', 'entities', '*.entity.{ts,js}'), 'src/**/entities/*.entity{.ts}'
    // ],
    synchronize: process.env.NODE_ENV !== 'production',
    // synchronize: true,
    // dropSchema: true,
    logging: false,
  });
// }
