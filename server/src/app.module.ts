import { Module } from '@nestjs/common';
import { AppController, AppController2 } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, AppController2],
  providers: [AppService],
})
export class AppModule {}
