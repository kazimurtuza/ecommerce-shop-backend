import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthProto } from '@org/shared';

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpcService!: AuthProto.AuthServiceClient;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authGrpcService = this.client.getService<AuthProto.AuthServiceClient>('AuthService');
  }

  async register(data: AuthProto.RegisterRequest) {
    return firstValueFrom(this.authGrpcService.register(data));
  }

  async sendOtp(data: AuthProto.SendOtpRequest) {
    return firstValueFrom(this.authGrpcService.sendOtp(data));
  }

  async verifyOtp(data: AuthProto.VerifyOtpRequest) {
    return firstValueFrom(this.authGrpcService.verifyOtp(data));
  }

  async loginWithEmail(data: AuthProto.EmailLoginRequest) {
    return firstValueFrom(this.authGrpcService.loginWithEmail(data));
  }

  async validateUser(data: AuthProto.ValidateUserRequest) {
    return firstValueFrom(this.authGrpcService.validateUser(data));
  }
}
