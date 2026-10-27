import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { defineConfig, env } from 'prisma/config';

dotenv.config({ path: path.resolve(process.cwd(), 'product-service/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('PRODUCT_DATABASE_URL') },
});
