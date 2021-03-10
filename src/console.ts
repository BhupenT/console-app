#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleController } from './console/console.controller';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const command = process.argv[2];
  const usersService = application.get(ConsoleController);
  usersService.initOptions(command);
}

bootstrap();
