import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { UserRolesEntity } from '../../modules/roles/entities/user-roles.entity';
import { FileEntity } from '../../modules/files/entities/file.entity';
import { TrackEntity } from '../../modules/tracks/entities/track.entity';
import { AlbumEntity } from '../../modules/albums/entities/album.entity';
import { ReactionEntity } from '../../modules/reactions/entities/reaction.entity';

export /* default */ const supabaseConfig = (): TypeOrmModuleOptions => ({
  name: 'supabase',
  type: 'postgres',
  host: process.env.SB_PG_HOST,
  port: /* + */ Number(process.env.SB_PG_PORT),
  database: process.env.SB_PG_DBN,
  username: process.env.SB_PG_USER,
  password: process.env.SB_PG_PSW,
  entities: [
    UserEntity,
    RoleEntity,
    UserRolesEntity,
    FileEntity,
    TrackEntity,
    AlbumEntity,
    ReactionEntity,
    // ! не отраб.подкл.по пути - постояный сбор query: SELECT * FROM current_schema() | ошб.в swg - "statusCode": 500, "message": "Internal server error
    // `../../*/entities/*.entity.ts`, `src/*/entities/*.entity{.ts,.js}`, `src/**/*.entity.ts`, `*/entities/**.entity{.ts}`, path.join(__dirname, 'src', '**', 'entities', '*.entity.{ts,js}'), '../**/entities/*.entity{.ts}'
  ],
  synchronize: false,
  logging: false,
});
