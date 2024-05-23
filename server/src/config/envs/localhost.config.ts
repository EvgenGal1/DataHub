import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// import { UserEntity } from '../../users/entities/user.entity';
// import { RoleEntity } from '../../roles/entities/role.entity';
// import { UserRolesEntity } from '../../roles/entities/user-roles.entity';
// import { FileEntity } from '../../files/entities/file.entity';
// import { TrackEntity } from '../../tracks/entities/track.entity';
// import { AlbumEntity } from '../../albums/entities/album.entity';
// import { ReactionEntity } from '../../reactions/entities/reaction.entity';

console.log('localhostConfig process.env.NODE_ENV : ', process.env.NODE_ENV);

export default /* const localhostConfig = */ (): TypeOrmModuleOptions => ({
  name: process.env.NODE_ENV !== 'production' ? 'localhost' : 'supabase',
  type: 'postgres',
  host:
    process.env.NODE_ENV !== 'production'
      ? process.env.LH_PG_HOST
      : process.env.SB_PG_HOST,
  port:
    process.env.NODE_ENV !== 'production'
      ? parseInt(process.env.LH_PG_PORT, 10) || 5432
      : Number(process.env.SB_PG_PORT),
  database:
    process.env.NODE_ENV !== 'production'
      ? process.env.LH_PG_DBN
      : process.env.SB_PG_DBN,
  username:
    process.env.NODE_ENV !== 'production'
      ? process.env.LH_PG_USER
      : process.env.SB_PG_USER,
  password:
    process.env.NODE_ENV !== 'production'
      ? process.env.LH_PG_PSW
      : process.env.SB_PG_PSW,
  // entities: [
  //   UserEntity,
  //   RoleEntity,
  //   UserRolesEntity,
  //   FileEntity,
  //   TrackEntity,
  //   AlbumEntity,
  //   ReactionEntity,
  //   // ! не отраб.подкл.по пути - постояный сбор query: SELECT * FROM current_schema() | ошб.в swg - "statusCode": 500, "message": "Internal server error
  //   // `../../*/entities/*.entity.ts`, `src/*/entities/*.entity{.ts,.js}`, `src/**/*.entity.ts`, `*/entities/**.entity{.ts}`, path.join(__dirname, 'src', '**', 'entities', '*.entity.{ts,js}'),
  // ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
});
