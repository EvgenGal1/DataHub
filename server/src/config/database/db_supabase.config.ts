import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { UserRolesEntity } from '../../modules/roles/entities/user-roles.entity';
import { FileEntity } from '../../modules/files/entities/file.entity';
import { TrackEntity } from '../../modules/tracks/entities/track.entity';
import { AlbumEntity } from '../../modules/albums/entities/album.entity';
import { ReactionEntity } from '../../modules/reactions/entities/reaction.entity';

export const DBSupabaseConfig = (): TypeOrmModuleOptions => ({
  name: 'supabase',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PSW,
  entities: [
    UserEntity,
    RoleEntity,
    UserRolesEntity,
    FileEntity,
    TrackEntity,
    AlbumEntity,
    ReactionEntity,
  ],
  synchronize: false,
  logging: false,
});
