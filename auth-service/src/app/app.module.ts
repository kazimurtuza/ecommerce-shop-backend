import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OtpController } from './otp/otp.controller';

import { UsersModule } from './users/users.module';
import { CredentialsModule } from './credentials/credentials.module';
import { OtpModule } from './otp/otp.module';
import { SocialAccountsModule } from './social-accounts/social-accounts.module';
import { SessionsModule } from './sessions/sessions.module';
import { AddressesModule } from './addresses/addresses.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CredentialsModule,
    OtpModule,
    SocialAccountsModule,
    SessionsModule,
    AddressesModule,
    RolesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt-auth-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController, OtpController],
  providers: [AppService],
})
export class AppModule {}
