import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from './prisma/prisma.service';
import { OtpService } from './otp/otp.service';
import { UsersService } from './users/users.service';
import { CredentialsService } from './credentials/credentials.service';
import { SessionsService } from './sessions/sessions.service';
import {
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  EmailLoginRequest,
  AuthTokenResponse,
  ValidateUserRequest,
  ValidateUserResponse,
} from '@org/shared';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly sessionsService: SessionsService,
  ) { }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async phoneRegister(data: RegisterRequest): Promise<AuthTokenResponse> {
    try {
      if (!data.phone) {
        return {
          success: false,
          message: 'Phone number is required for phone registration',
        };
      }

      const existingPhone = await this.usersService.findByPhone(data.phone);

      // If phone and OTP both are provided, verify OTP and issue tokens
      if (data.otp) {
        let user = existingPhone;
        if (!user) {
          return {
            success: false,
            message: `User with phone "${data.phone}" not found. Please register first.`,
          };
        }

        const otpVerify = await this.otpService.verifyOtp({
          phone: data.phone,
          otp: data.otp,
          purpose: 'login',
        });

        if (!otpVerify.verified) {
          return {
            success: false,
            message: 'Invalid or expired OTP code',
          };
        }

        // Mark phone as verified
        await this.prisma.user.update({
          where: { id: user.id },
          data: { phone_verified_at: new Date() },
        });

        const payload = { sub: user.id, email: user.email, phone: user.phone };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await this.sessionsService.createSession({
          user_id: user.id,
          refresh_token_hash: refreshTokenHash,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        return {
          success: true,
          message: 'OTP verified successfully. Login successful.',
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status,
          },
        } as AuthTokenResponse;
      }

      // If phone already exists, send OTP for login
      if (existingPhone) {
        const otpResult = await this.otpService.sendOtp({
          phone: data.phone,
          purpose: 'login',
          user_id: existingPhone.id,
        });
        return {
          success: true,
          message: `User with phone "${data.phone}" already exists. OTP sent for login.`,
          otp_preview: otpResult.otpPreview,
          otpPreview: otpResult.otpPreview,
        } as any;
      }

      // If phone does not exist, create user then send OTP for login
      const created = await this.usersService.createUser({
        name: data.name || `User ${data.phone.slice(-4)}`,
        email: data.email,
        password: data.password,
        phone: data.phone,
        status: 'active',
      });
      const user = created.user;

      const otpResult = await this.otpService.sendOtp({
        phone: data.phone,
        purpose: 'login',
        user_id: user.id,
      });

      return {
        success: true,
        message: `User registered successfully with phone ${data.phone}. OTP sent for login.`,
        otp_preview: otpResult.otpPreview,
        otpPreview: otpResult.otpPreview,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
        },
      } as any;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Phone registration failed',
        error: error.message,
      };
    }
  }

  async mailRegister(data: RegisterRequest): Promise<AuthTokenResponse> {
    try {
      if (!data.email) {
        return {
          success: false,
          message: 'Email is required for email registration',
        };
      }

      const existingEmail = await this.usersService.findByEmail(data.email);
      if (existingEmail) {
        return {
          success: false,
          message: `User with email "${data.email}" already exists`,
        };
      }

      const created = await this.usersService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        status: 'active',
      });
      const user = created.user;

      const payload = { sub: user.id, email: user.email, phone: user.phone };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.sessionsService.createSession({
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        success: true,
        message: 'Registration successful',
        access_token: accessToken,
        accessToken: accessToken,
        refresh_token: refreshToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
        },
      } as any;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Email registration failed',
        error: error.message,
      };
    }
  }

  async register(data: RegisterRequest): Promise<AuthTokenResponse> {
    if (data.phone) {
      return this.phoneRegister(data);
    }
    if (data.email) {
      return this.mailRegister(data);
    }
    return {
      success: false,
      message: 'Either email or phone number is required for registration',
    };
  }

  async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    try {
      if (!data.phone) {
        return {
          success: false,
          message: 'Phone number is required',
        };
      }

      let user = await this.usersService.findByPhone(data.phone);
      let isNewUser = false;

      if (!user) {
        const created = await this.usersService.createUser({
          name: `User ${data.phone.slice(-4)}`,
          phone: data.phone,
          status: 'active',
        });
        user = created.user;
        isNewUser = true;
      }

      const result = await this.otpService.sendOtp({
        phone: data.phone,
        purpose: data.purpose || 'login',
        user_id: user.id,
      });
      return {
        success: true,
        message: isNewUser
          ? `User created successfully. OTP sent to ${data.phone}`
          : result.message,
        otp_preview: result.otpPreview,
        otpPreview: result.otpPreview,
      } as any;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send OTP',
      };
    }
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<AuthTokenResponse> {
    try {
      const result = await this.otpService.verifyOtp({
        phone: data.phone,
        otp: data.otp,
        purpose: data.purpose || 'login',
      });

      if (!result.verified) {
        return {
          success: false,
          message: 'Invalid OTP code',
        };
      }

      // Check if user exists with this phone
      let user = await this.usersService.findByPhone(data.phone);

      if (!user) {
        // Create user automatically on first OTP login
        const created = await this.usersService.createUser({
          name: `User ${data.phone.slice(-4)}`,
          phone: data.phone,
          status: 'active',
        });
        user = created.user;
      }

      // Mark phone as verified
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phone_verified_at: new Date() },
      });

      // Generate JWT tokens
      const payload = { sub: user.id, email: user.email, phone: user.phone };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Save user session
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.sessionsService.createSession({
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        success: true,
        message: 'OTP verified successfully. Login successful.',
        access_token: accessToken,
        accessToken: accessToken,
        refresh_token: refreshToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
        },
      } as any;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to verify OTP',
        error: error.message,
      };
    }
  }

  async loginWithEmail(data: EmailLoginRequest): Promise<AuthTokenResponse> {
    try {
      const user = await this.usersService.findByEmail(data.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      if (data.password) {
        const passwordHash = this.hashPassword(data.password);
        const isValid = await this.credentialsService.validatePassword(user.id, passwordHash);
        if (!isValid) {
          return {
            success: false,
            message: 'Invalid email or password',
          };
        }
      } else {
        return {
          success: false,
          message: 'Password is required',
        };
      }

      // Generate JWT tokens
      const payload = { sub: user.id, email: user.email, phone: user.phone };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Save user session
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.sessionsService.createSession({
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        success: true,
        message: 'Login successful',
        access_token: accessToken,
        accessToken: accessToken,
        refresh_token: refreshToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
        },
      } as any;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed',
        error: error.message,
      };
    }
  }

  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    const user = await this.usersService.findById(data.user_id);
    if (user) {
      return {
        is_valid: true,
        data: user.name,
      };
    }
    return {
      is_valid: false,
      data: '',
    };
  }
}
