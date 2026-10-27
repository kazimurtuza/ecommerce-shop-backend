import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getProductProtoPath, PRODUCT_PACKAGE } from '@org/shared';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: PRODUCT_PACKAGE,
          protoPath: getProductProtoPath(),
          url: process.env.PRODUCT_GRPC_URL || 'localhost:50053',
        },
      },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
