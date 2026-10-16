import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  async sendOtp(dto: SendOtpDto): Promise<{ success: boolean; message: string; otpPreview?: string }> {
    // Generate 6 digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = this.hashOtp(generatedOtp);

    // 5 minutes expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        user_id: dto.user_id ? Number(dto.user_id) : null,
        phone: dto.phone,
        otp_hash: otpHash,
        purpose: dto.purpose,
        attempts: 0,
        expires_at: expiresAt,
      },
    });

    return {
      success: true,
      message: `OTP sent successfully to ${dto.phone}`,
      otpPreview: generatedOtp,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ success: boolean; message: string; verified: boolean }> {
    const hashed = this.hashOtp(dto.otp);

    // Find latest active OTP for phone and purpose
    let record = await this.prisma.otpVerification.findFirst({
      where: {
        phone: dto.phone,
        purpose: dto.purpose,
        verified_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      record = await this.prisma.otpVerification.findFirst({
        where: {
          phone: dto.phone,
          verified_at: null,
        },
        orderBy: { created_at: 'desc' },
      });
    }

    if (!record) {
      throw new BadRequestException('No active OTP found for this phone number');
    }

    if (new Date() > record.expires_at) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    // Increment attempts
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    if (record.otp_hash !== hashed) {
      return {
        success: false,
        message: 'Invalid OTP',
        verified: false,
      };
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified_at: new Date() },
    });

    return {
      success: true,
      message: 'OTP verified successfully',
      verified: true,
    };
  }
}
