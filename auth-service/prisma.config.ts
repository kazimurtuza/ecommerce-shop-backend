import dotenv from 'dotenv';
import path from 'path';
import { defineConfig, env } from 'prisma/config';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: path.join(__dirname, 'prisma/migrations'),
  },
});
