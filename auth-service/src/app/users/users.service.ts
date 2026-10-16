import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async createUser(dto: CreateUserDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone number is required to register');
    }

    const email = dto.email ? dto.email.toLowerCase().trim() : null;
    const phone = dto.phone ? dto.phone.trim() : null;

    // Check if user with email already exists
    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException(`User with email "${dto.email}" already exists`);
      }
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        throw new ConflictException(`User with phone "${dto.phone}" already exists`);
      }

      // If OTP is provided, verify it
      if (dto.otp) {
        const otpResult = await this.otpService.verifyOtp({
          phone,
          otp: dto.otp,
          purpose: 'register',
        });
        if (!otpResult.verified) {
          throw new BadRequestException('Invalid or expired OTP for phone number');
        }
      }
    }

    // Default role name
    const roleName = (dto.role || 'user').toLowerCase();

    // Ensure role exists in roles table
    let role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      role = await this.prisma.role.create({
        data: { name: roleName, description: `${roleName} role` },
      });
    }

    // Atomic transaction to create user, credentials, and assign role
    const newUser = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name: dto.name,
          email,
          phone,
          status: dto.status || 'active',
          phone_verified_at: dto.otp ? new Date() : null,
          credentials: dto.password
            ? {
                create: {
                  password_hash: this.hashPassword(dto.password),
                },
              }
            : undefined,
          roles: {
            create: {
              role_id: role.id,
            },
          },
        },
        include: {
          roles: { include: { role: true } },
          credentials: true,
        },
      });
    });

    return {
      user: newUser,
      message: 'User created successfully',
    };
  }

  async findById(id: string | number) {
    const numId = Number(id);
    return this.prisma.user.findUnique({
      where: { id: numId },
      include: {
        roles: { include: { role: true } },
        addresses: true,
        social_accounts: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone: phone.trim() },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async updateUser(id: string | number, dto: UpdateUserDto) {
    const numId = Number(id);
    const user = await this.prisma.user.findUnique({ where: { id: numId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return this.prisma.user.update({
      where: { id: numId },
      data: {
        name: dto.name,
        phone: dto.phone,
        status: dto.status,
        email_verified_at: dto.email_verified_at,
        phone_verified_at: dto.phone_verified_at,
      },
    });
  }

  async verifyEmail(id: string | number) {
    return this.updateUser(id, { email_verified_at: new Date() });
  }

  async verifyPhone(id: string | number) {
    return this.updateUser(id, { phone_verified_at: new Date() });
  }

  async sendPhoneOtp(phone: string, purpose = 'register') {
    return this.otpService.sendOtp({
      phone: phone.trim(),
      purpose,
    });
  }

  async verifyPhoneOtp(phone: string, otp: string, purpose = 'register') {
    const result = await this.otpService.verifyOtp({
      phone: phone.trim(),
      otp: otp.trim(),
      purpose,
    });

    if (result.verified) {
      const user = await this.findByPhone(phone);
      if (user) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { phone_verified_at: new Date() },
        });
      }
    }

    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        roles: { include: { role: true } },
      },
    });
  }
}
