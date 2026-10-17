/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure api-gateway/.env is loaded if running from workspace root or dist
dotenv.config({ path: path.resolve(process.cwd(), 'api-gateway/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
