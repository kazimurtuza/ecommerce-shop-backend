import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getAuthProtoPath, AUTH_PACKAGE } from '@org/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE,
          protoPath: getAuthProtoPath(),
          url: process.env.AUTH_GRPC_URL || 'localhost:4001',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
