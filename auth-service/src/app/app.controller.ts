import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import type {
  RegisterRequest,
  EmailLoginRequest,
  AuthTokenResponse,
  ValidateUserRequest,
  ValidateUserResponse,
} from '@org/shared';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterRequest): Promise<AuthTokenResponse> {
    console.log('[gRPC AuthService.Register] received:', { email: data.email, phone: data.phone });
    if (data.phone) {
      return this.appService.phoneRegister(data);
    }
    if (data.email) {
      return this.appService.mailRegister(data);
    }
    return {
      success: false,
      message: 'Either email or phone number is required for registration',
    };
  }

  @GrpcMethod('AuthService', 'PhoneRegister')
  async phoneRegister(data: RegisterRequest): Promise<AuthTokenResponse> {
    console.log('[gRPC AuthService.PhoneRegister] received for phone:', data.phone);
    return this.appService.phoneRegister(data);
  }

  @GrpcMethod('AuthService', 'MailRegister')
  async mailRegister(data: RegisterRequest): Promise<AuthTokenResponse> {
    console.log('[gRPC AuthService.MailRegister] received for email:', data.email);
    return this.appService.mailRegister(data);
  }

  @GrpcMethod('AuthService', 'LoginWithEmail')
  async loginWithEmail(data: EmailLoginRequest): Promise<AuthTokenResponse> {
    console.log('[gRPC AuthService.LoginWithEmail] received for email:', data.email);
    return this.appService.loginWithEmail(data);
  }

  @GrpcMethod('AuthService', 'ValidateUser')
  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    console.log('[gRPC AuthService.ValidateUser] received:', data);
    return this.appService.validateUser(data);
  }
}
