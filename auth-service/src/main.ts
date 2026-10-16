/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import {
  getAuthProtoPath,
  getUserProtoPath,
  AUTH_PACKAGE,
  USER_PACKAGE,
} from '@org/shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: [AUTH_PACKAGE, USER_PACKAGE],
      protoPath: [
        getAuthProtoPath(),
        getUserProtoPath(),
      ],
      url: '0.0.0.0:4001',
    },
  });
  await app.listen();
  console.log("Auth Service (gRPC) is running on port 4001");
}

bootstrap();
