import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AuthServiceClient,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  EmailLoginRequest,
  ValidateUserRequest,
} from '@org/shared';

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpcService!: AuthServiceClient;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authGrpcService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async register(data: RegisterRequest) {
    return firstValueFrom(this.authGrpcService.register(data));
  }

  async sendOtp(data: SendOtpRequest) {
    return firstValueFrom(this.authGrpcService.sendOtp(data));
  }

  async verifyOtp(data: VerifyOtpRequest) {
    return firstValueFrom(this.authGrpcService.verifyOtp(data));
  }

  async loginWithEmail(data: EmailLoginRequest) {
    return firstValueFrom(this.authGrpcService.loginWithEmail(data));
  }

  async validateUser(data: ValidateUserRequest) {
    return firstValueFrom(this.authGrpcService.validateUser(data));
  }
}
