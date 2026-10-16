import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SocialAccountsService } from './social-accounts.service';
import { LinkSocialAccountDto } from './dto/social-account.dto';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}

  @Post('link')
  @MessagePattern({ cmd: 'linkSocialAccount' })
  async linkAccount(@Payload() @Body() dto: LinkSocialAccountDto) {
    try {
      const result = await this.socialAccountsService.linkAccount(dto);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('user/:userId')
  @MessagePattern({ cmd: 'getSocialAccountsByUserId' })
  async getByUserId(@Payload() @Param('userId') data: { userId: string | number } | string | number) {
    const userId = typeof data === 'object' && 'userId' in data ? data.userId : data;
    const accounts = await this.socialAccountsService.findByUserId(userId);
    return { success: true, data: accounts };
  }

  @Delete(':userId/:provider')
  @MessagePattern({ cmd: 'unlinkSocialAccount' })
  async unlinkAccount(
    @Payload() data: { userId: string | number; provider: string },
    @Param('userId') paramUserId?: string,
    @Param('provider') paramProvider?: string,
  ) {
    const userId = data?.userId || paramUserId;
    const provider = data?.provider || paramProvider;
    if (!userId || !provider) {
      return { success: false, message: 'Invalid payload' };
    }
    const unlinked = await this.socialAccountsService.unlinkAccount(userId, provider);
    return { success: unlinked };
  }
}
