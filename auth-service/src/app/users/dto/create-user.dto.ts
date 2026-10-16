import { UserStatus } from '../models/user.model';

export class CreateUserDto {
  name!: string;
  email?: string | null;
  phone?: string | null;
  password?: string;
  status?: UserStatus | string;
  role?: string;
  otp?: string;
}

export class UpdateUserDto {
  name?: string;
  phone?: string | null;
  status?: UserStatus | string;
  email_verified_at?: Date | null;
  phone_verified_at?: Date | null;
}
