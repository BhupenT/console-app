import { HttpModule, Module } from '@nestjs/common';
import { ExportProductService } from './export.products.service';
import { ConsoleController } from './console.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [ExportProductService],
  controllers: [ConsoleController],
})
export class MyConsoleModule {}
