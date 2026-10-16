import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, RevokeSessionDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(dto: CreateSessionDto) {
    return this.prisma.userSession.create({
      data: {
        user_id: Number(dto.user_id),
        refresh_token_hash: dto.refresh_token_hash,
        device_name: dto.device_name || null,
        ip_address: dto.ip_address || null,
        user_agent: dto.user_agent || null,
        expires_at: new Date(dto.expires_at),
      },
    });
  }

  async findById(sessionId: string | number) {
    return this.prisma.userSession.findUnique({
      where: { id: Number(sessionId) },
    });
  }

  async getUserSessions(userId: string | number) {
    return this.prisma.userSession.findMany({
      where: {
        user_id: Number(userId),
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    });
  }

  async revokeSession(dto: RevokeSessionDto): Promise<boolean> {
    const id = Number(dto.session_id);
    const session = await this.findById(id);
    if (!session) {
      throw new NotFoundException(`Session "${dto.session_id}" not found`);
    }

    if (dto.user_id && session.user_id !== Number(dto.user_id)) {
      throw new NotFoundException('Session does not belong to this user');
    }

    await this.prisma.userSession.update({
      where: { id },
      data: { revoked_at: new Date() },
    });
    return true;
  }

  async revokeAllUserSessions(userId: string | number): Promise<number> {
    const result = await this.prisma.userSession.updateMany({
      where: {
        user_id: Number(userId),
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });
    return result.count;
  }

  async validateSession(sessionId: string | number, tokenHash: string): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session || session.revoked_at || new Date() > session.expires_at) {
      return false;
    }
    return session.refresh_token_hash === tokenHash;
  }
}
