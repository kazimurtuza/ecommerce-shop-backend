import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';

@Module({
  providers: [OtpService, SmsService],
  exports: [OtpService, SmsService],
})
export class OtpModule {}
