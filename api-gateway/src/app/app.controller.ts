import { Controller, Post, Body, Get, Param, Inject, OnModuleInit, BadRequestException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGrpcService } from '@org/shared';

@Controller('auth')
export class AppController implements OnModuleInit {
  private authGrpcService!: AuthGrpcService;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authGrpcService = this.client.getService<AuthGrpcService>('AuthService');
  }

  @Post('register')
  async register(@Body() body: { name: string; email?: string; password?: string; phone?: string; otp?: string }) {
    if (!body?.name || (!body?.email && !body?.phone)) {
      throw new BadRequestException('Name and either email or phone number are required');
    }
    return firstValueFrom(this.authGrpcService.register(body));
  }

  @Post('otp/send')
  async sendOtp(@Body() body: { phone: string; purpose?: string }) {
    if (!body?.phone) {
      throw new BadRequestException('Phone number is required');
    }
    return firstValueFrom(this.authGrpcService.sendOtp(body));
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: { phone: string; otp: string; purpose?: string }) {
    if (!body?.phone || !body?.otp) {
      throw new BadRequestException('Phone and OTP are required');
    }
    return firstValueFrom(this.authGrpcService.verifyOtp(body));
  }

  @Post('login')
  async loginWithEmail(@Body() body: { email: string; password?: string }) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('Email and password are required');
    }
    return firstValueFrom(this.authGrpcService.loginWithEmail({ email: body.email, password: body.password }));
  }

  @Get('validate/:id')
  async validateUser(@Param('id') id: string) {
    return firstValueFrom(this.authGrpcService.validateUser({ user_id: Number(id) }));
  }
}
