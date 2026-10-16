import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto, ChangePasswordDto } from './dto/credential.dto';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @MessagePattern({ cmd: 'createCredential' })
  async createCredential(@Payload() @Body() dto: CreateCredentialDto) {
    return this.credentialsService.create(dto);
  }

  @Get(':userId')
  @MessagePattern({ cmd: 'getCredentialByUserId' })
  async getByUserId(@Payload() @Param('userId') data: { userId: string | number } | string | number) {
    const userId = typeof data === 'object' && 'userId' in data ? data.userId : data;
    const cred = await this.credentialsService.findByUserId(userId);
    return cred ? { success: true, data: cred } : { success: false, data: null };
  }

  @Post('change-password')
  @MessagePattern({ cmd: 'changePassword' })
  async changePassword(@Payload() @Body() dto: ChangePasswordDto) {
    const updated = await this.credentialsService.changePassword(dto);
    return updated
      ? { success: true, message: 'Password changed successfully' }
      : { success: false, message: 'User credential not found' };
  }
}
