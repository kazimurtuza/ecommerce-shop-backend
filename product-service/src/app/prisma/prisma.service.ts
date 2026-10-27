import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.PRODUCT_DATABASE_URL;
    if (!connectionString) {
      throw new Error('PRODUCT_DATABASE_URL is required by product-service');
    }
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the product database.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
