import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserProto } from '@org/shared';

function toGrpcUser(user: any): UserProto.User {
  const roleName = user.roles?.[0]?.role?.name || user.role || undefined;
  return {
    id: String(user.id),
    name: user.name,
    email: user.email || undefined,
    phone: user.phone || undefined,
    status: user.status || undefined,
    role: roleName,
  };
}

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: UserProto.CreateUserRequest): Promise<UserProto.UserResponse> {
    try {
      const result = await this.usersService.createUser(data);
      return {
        success: true,
        data: toGrpcUser(result.user),
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create user',
      };
    }
  }

  @GrpcMethod('UserService', 'GetAllUsers')
  async getAllUsers(): Promise<UserProto.UserListResponse> {
    try {
      const users = await this.usersService.findAll();
      return {
        success: true,
        data: users.map(toGrpcUser),
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
      };
    }
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: UserProto.GetUserByIdRequest): Promise<UserProto.UserResponse> {
    try {
      const user = await this.usersService.findById(data.id);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      return {
        success: true,
        data: toGrpcUser(user),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @GrpcMethod('UserService', 'GetUserByEmail')
  async getUserByEmail(data: UserProto.GetUserByEmailRequest): Promise<UserProto.UserResponse> {
    try {
      const user = await this.usersService.findByEmail(data.email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      return {
        success: true,
        data: toGrpcUser(user),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @GrpcMethod('UserService', 'GetUserByPhone')
  async getUserByPhone(data: UserProto.GetUserByPhoneRequest): Promise<UserProto.UserResponse> {
    try {
      const user = await this.usersService.findByPhone(data.phone);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      return {
        success: true,
        data: toGrpcUser(user),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: UserProto.UpdateUserRequest): Promise<UserProto.UserResponse> {
    try {
      const updated = await this.usersService.updateUser(data.id, data);
      return {
        success: true,
        data: toGrpcUser(updated),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @GrpcMethod('UserService', 'VerifyEmail')
  async verifyEmail(data: UserProto.VerifyUserRequest): Promise<UserProto.UserResponse> {
    try {
      const updated = await this.usersService.verifyEmail(data.id);
      return {
        success: true,
        data: toGrpcUser(updated),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @GrpcMethod('UserService', 'VerifyPhone')
  async verifyPhone(data: UserProto.VerifyUserRequest): Promise<UserProto.UserResponse> {
    try {
      const updated = await this.usersService.verifyPhone(data.id);
      return {
        success: true,
        data: toGrpcUser(updated),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
