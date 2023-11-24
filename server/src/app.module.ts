import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entities/user.entity';
import { TrackModule } from './track/track.module';
import { TrackEntity } from './track/entities/track.entity';
import { CommentEntity } from './track/entities/comment.entity';
import { AlbumModule } from './album/album.module';
import { AlbumEntity } from './album/entities/album.entity';
// import { AppController, AppController2 } from './app.controller';
// import { AppService } from './app.service';
import { FilesModule } from './files/files.module';
import { FileEntity } from './files/entities/file.entity';
import { RolesModule } from './roles/roles.module';
import { RoleEntity } from './roles/entities/role.entity';

// Комп.Прилож
@Module({
  imports: [
    // подкл.модуль для счит.перем.из.env
    ConfigModule.forRoot({
      // путь к ф.конфиг. (по умолч.ищет в корне .env)
      envFilePath: '.env',
      // повысить производитюдоступа к перем.в process.env.
      cache: true,
    }),
    // подкл.к БД ч/з перем.process.env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRESS_PORT) || 5432,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRESS_PASSWORD,
      // указ.`сущности` для авто.синхронз.измен. ч/з TypeOrmModule
      entities: [
        UserEntity,
        TrackEntity,
        CommentEntity,
        AlbumEntity,
        FileEntity,
        RoleEntity,
      ],
      // ^^ ТОЛЬКО DEV
      synchronize: true,
    }),
    // подкл.использ.modulи
    // AuthModule,
    UsersModule,
    TrackModule,
    AlbumModule,
    FilesModule,
    RolesModule,
  ],
})
export class AppModule {}
