import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getProductProtoPath, PRODUCT_PACKAGE } from '@org/shared';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributeValuesController } from './attribute-values.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: PRODUCT_PACKAGE,
          protoPath: getProductProtoPath(),
          url: process.env.PRODUCT_GRPC_URL || 'localhost:4002',
        },
      },
    ]),
  ],
  providers: [AttributesService],
  controllers: [AttributesController, AttributeValuesController],
})
export class AttributesModule {}
