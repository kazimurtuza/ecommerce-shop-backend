import { Module } from '@nestjs/common';
import { AttributeValuesService } from './attribute-values.service';
import { AttributeValuesController } from './attribute-values.controller';

@Module({
  providers: [AttributeValuesService],
  controllers: [AttributeValuesController],
})
export class AttributeValuesModule {}
