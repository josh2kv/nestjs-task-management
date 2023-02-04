import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DdModule } from './dd/dd.module';

@Module({
  imports: [DdModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
