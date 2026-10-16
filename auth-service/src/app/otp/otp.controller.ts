import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from '../app.service';
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  AuthTokenResponse,
} from '@org/shared';

@Controller()
export class OtpController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AuthService', 'SendOtp')
  async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    console.log('[gRPC AuthService.SendOtp] received:', data);
    return this.appService.sendOtp(data);
  }

  @GrpcMethod('AuthService', 'VerifyOtp')
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthTokenResponse> {
    console.log('[gRPC AuthService.VerifyOtp] received for phone:', data.phone);
    return this.appService.verifyOtp(data);
  }
}
