import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { AttributesModule } from './attributes/attributes.module';
import { AttributeValuesModule } from './attribute-values/attribute-values.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    AttributesModule,
    AttributeValuesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
