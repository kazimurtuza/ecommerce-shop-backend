import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, RevokeSessionDto } from './dto/session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @MessagePattern({ cmd: 'createSession' })
  async createSession(@Payload() @Body() dto: CreateSessionDto) {
    try {
      const session = await this.sessionsService.createSession(dto);
      return { success: true, data: session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('user/:userId')
  @MessagePattern({ cmd: 'getUserSessions' })
  async getUserSessions(@Payload() @Param('userId') data: { userId: string | number } | string | number) {
    const userId = typeof data === 'object' && 'userId' in data ? data.userId : data;
    const sessions = await this.sessionsService.getUserSessions(userId);
    return { success: true, data: sessions };
  }

  @Delete('revoke')
  @MessagePattern({ cmd: 'revokeSession' })
  async revokeSession(@Payload() @Body() dto: RevokeSessionDto) {
    try {
      const revoked = await this.sessionsService.revokeSession(dto);
      return { success: revoked };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Delete('user/:userId/revoke-all')
  @MessagePattern({ cmd: 'revokeAllUserSessions' })
  async revokeAllUserSessions(@Payload() @Param('userId') data: { userId: string | number } | string | number) {
    const userId = typeof data === 'object' && 'userId' in data ? data.userId : data;
    const count = await this.sessionsService.revokeAllUserSessions(userId);
    return { success: true, revokedCount: count };
  }
}
