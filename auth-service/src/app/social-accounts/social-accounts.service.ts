import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkSocialAccountDto } from './dto/social-account.dto';

@Injectable()
export class SocialAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async linkAccount(dto: LinkSocialAccountDto) {
    const existing = await this.prisma.socialAccount.findUnique({
      where: {
        provider_provider_account_id: {
          provider: dto.provider,
          provider_account_id: dto.provider_account_id,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Social account for provider "${dto.provider}" with ID "${dto.provider_account_id}" is already linked`,
      );
    }

    return this.prisma.socialAccount.create({
      data: {
        user_id: Number(dto.user_id),
        provider: dto.provider,
        provider_account_id: dto.provider_account_id,
        email: dto.email || null,
      },
    });
  }

  async findByProvider(provider: string, providerAccountId: string) {
    return this.prisma.socialAccount.findUnique({
      where: {
        provider_provider_account_id: {
          provider,
          provider_account_id: providerAccountId,
        },
      },
    });
  }

  async findByUserId(userId: string | number) {
    return this.prisma.socialAccount.findMany({
      where: { user_id: Number(userId) },
    });
  }

  async unlinkAccount(userId: string | number, provider: string): Promise<boolean> {
    try {
      await this.prisma.socialAccount.deleteMany({
        where: {
          user_id: Number(userId),
          provider,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
