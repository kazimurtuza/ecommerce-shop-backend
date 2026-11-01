import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandsController } from './brands.controller';
import { BrandService } from './brands.service';

@Module({
  imports: [PrismaModule],
  controllers: [BrandsController],
  providers: [BrandService],
})
export class BrandsModule {}
