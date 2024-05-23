import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// import { UserEntity } from '../../users/entities/user.entity';
// import { RoleEntity } from '../../roles/entities/role.entity';
// import { UserRolesEntity } from '../../roles/entities/user-roles.entity';
// import { FileEntity } from '../../files/entities/file.entity';
// import { TrackEntity } from '../../tracks/entities/track.entity';
// import { AlbumEntity } from '../../albums/entities/album.entity';
// import { ReactionEntity } from '../../reactions/entities/reaction.entity';

export const supabaseConfig = (): TypeOrmModuleOptions => ({
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
  //   // `../../*/entities/*.entity.ts`, `src/*/entities/*.entity{.ts,.js}`, `src/**/*.entity.ts`, `*/entities/**.entity{.ts}`, path.join(__dirname, 'src', '**', 'entities', '*.entity.{ts,js}'), '../**/entities/*.entity{.ts}'
  // ],
  synchronize: process.env.NODE_ENV !== 'production',
  // synchronize: true,
  // dropSchema: true,
  logging: false,
});
