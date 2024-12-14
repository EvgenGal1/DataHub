import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { UserRolesEntity } from '../../modules/roles/entities/user-roles.entity';
import { FileEntity } from '../../modules/files/entities/file.entity';
import { TrackEntity } from '../../modules/tracks/entities/track.entity';
import { AlbumEntity } from '../../modules/albums/entities/album.entity';
import { ReactionEntity } from '../../modules/reactions/entities/reaction.entity';

export const DBLocalhostConfig = (): TypeOrmModuleOptions => ({
  name: process.env.DB_NAM,
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
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
  synchronize: true,
  // logging: true,
  logging: ['error', 'warn'],
});
