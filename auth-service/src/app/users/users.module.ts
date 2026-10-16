import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CredentialsModule } from '../credentials/credentials.module';
import { RolesModule } from '../roles/roles.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [CredentialsModule, RolesModule, OtpModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
