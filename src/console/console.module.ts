import { HttpModule, Module } from '@nestjs/common';
import { ExportProductService } from './export.products.service';
import { ConsoleController } from './console.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
  providers: [ExportProductService],
  controllers: [ConsoleController],
})
export class MyConsoleModule {}
