import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, AssignRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Optionally seed default roles if table is empty
    try {
      const count = await this.prisma.role.count();
      if (count === 0) {
        await this.prisma.role.createMany({
          data: [
            { name: 'user', description: 'Standard user' },
            { name: 'admin', description: 'Administrator' },
          ],
          skipDuplicates: true,
        });
      }
    } catch {
      // Ignore if DB not yet migrated
    }
  }

  async createRole(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: dto.name.toLowerCase().trim(),
        description: dto.description || null,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name: name.toLowerCase().trim() },
    });
  }

  async findById(id: string | number) {
    return this.prisma.role.findUnique({
      where: { id: Number(id) },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany();
  }

  async assignRoleToUser(dto: AssignRoleDto) {
    const userId = Number(dto.user_id);
    const roleId = Number(dto.role_id);

    return this.prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: userId,
          role_id: roleId,
        },
      },
      update: {},
      create: {
        user_id: userId,
        role_id: roleId,
      },
    });
  }

  async getUserRoles(userId: string | number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: Number(userId) },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role);
  }

  async removeRoleFromUser(userId: string | number, roleId: string | number): Promise<boolean> {
    try {
      await this.prisma.userRole.delete({
        where: {
          user_id_role_id: {
            user_id: Number(userId),
            role_id: Number(roleId),
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
