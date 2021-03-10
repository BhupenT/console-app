import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { MyConsoleModule } from './console/console.module';

@Module({
  imports: [ProductsModule, MyConsoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
