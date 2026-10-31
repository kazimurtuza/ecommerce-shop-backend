import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { AttributesModule } from './attributes/attributes.module';

@Module({
  imports: [AuthModule, CategoriesModule, AttributesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
