/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getProductProtoPath, PRODUCT_PACKAGE } from '@org/shared';
import { AppModule } from './app/app.module';

dotenv.config({ path: path.resolve(process.cwd(), 'product-service/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PRODUCT_PACKAGE,
      protoPath: getProductProtoPath(),
      url: process.env.PRODUCT_GRPC_BIND_URL || '0.0.0.0:50053',
    },
  });
  await app.listen();
  Logger.log(`Product gRPC service is running on ${process.env.PRODUCT_GRPC_BIND_URL || '0.0.0.0:50053'}`);
}

bootstrap();
