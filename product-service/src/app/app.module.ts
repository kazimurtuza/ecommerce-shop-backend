import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { AttributesModule } from './attributes/attributes.module';
import { AttributeValuesModule } from './attribute-values/attribute-values.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    AttributesModule,
    AttributeValuesModule,
    BrandsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
