import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyConsoleModule } from './console/console.module';

@Module({
  imports: [MyConsoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
