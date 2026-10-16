import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { CreateRoleDto, AssignRoleDto } from './dto/role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @MessagePattern({ cmd: 'createRole' })
  async createRole(@Payload() @Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  @MessagePattern({ cmd: 'getAllRoles' })
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Post('assign')
  @MessagePattern({ cmd: 'assignRole' })
  async assignRole(@Payload() @Body() dto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(dto);
  }

  @Get('user/:userId')
  @MessagePattern({ cmd: 'getUserRoles' })
  async getUserRoles(@Payload() @Param('userId') data: { userId: string | number } | string | number) {
    const userId = typeof data === 'object' && 'userId' in data ? data.userId : data;
    return this.rolesService.getUserRoles(userId);
  }
}
