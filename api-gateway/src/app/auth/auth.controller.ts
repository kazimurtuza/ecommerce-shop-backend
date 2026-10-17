import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { name: string; email?: string; password?: string; phone?: string; otp?: string }
  ) {
    if (!body?.name || (!body?.email && !body?.phone)) {
      throw new BadRequestException('Name and either email or phone number are required');
    }
    return this.authService.register(body);
  }

  @Post('otp/send')
  async sendOtp(@Body() body: { phone: string; purpose?: string }) {
    if (!body?.phone) {
      throw new BadRequestException('Phone number is required');
    }
    return this.authService.sendOtp(body);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: { phone: string; otp: string; purpose?: string }) {
    if (!body?.phone || !body?.otp) {
      throw new BadRequestException('Phone and OTP are required');
    }
    return this.authService.verifyOtp(body);
  }

  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string; phone?: string; otp?: string; purpose?: string }
  ) {
    if (body?.phone) {
      // If phone and otp are provided, verify OTP and issue tokens
      if (body?.otp) {
        return this.authService.verifyOtp({
          phone: body.phone,
          otp: body.otp,
          purpose: body.purpose || 'login',
        });
      }
      // If only phone is provided, send OTP for login
      return this.authService.sendOtp({
        phone: body.phone,
        purpose: body.purpose || 'login',
      });
    }

    if (body?.email && body?.password) {
      return this.authService.loginWithEmail({ email: body.email, password: body.password });
    }

    throw new BadRequestException(
      'Please provide either (email & password) or phone number (with optional otp)'
    );
  }

  @Get('validate/:id')
  async validateUser(@Param('id') id: string) {
    return this.authService.validateUser({ user_id: Number(id) });
  }
}
