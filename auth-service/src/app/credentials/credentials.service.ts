import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto, ChangePasswordDto } from './dto/credential.dto';

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCredentialDto) {
    return this.prisma.userCredential.create({
      data: {
        user_id: Number(dto.user_id),
        password_hash: dto.password_hash,
      },
    });
  }

  async findByUserId(userId: string | number) {
    return this.prisma.userCredential.findUnique({
      where: { user_id: Number(userId) },
    });
  }

  async changePassword(dto: ChangePasswordDto) {
    const userId = Number(dto.user_id);
    return this.prisma.userCredential.update({
      where: { user_id: userId },
      data: {
        password_hash: dto.new_password_hash,
        password_changed_at: new Date(),
      },
    });
  }

  async validatePassword(userId: string | number, passwordHash: string): Promise<boolean> {
    const cred = await this.findByUserId(userId);
    if (!cred) {
      return false;
    }
    return cred.password_hash === passwordHash;
  }
}
