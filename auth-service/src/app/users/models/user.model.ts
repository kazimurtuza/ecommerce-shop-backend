export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface IUser {
  id: string | number;
  name: string;
  phone: string | null;
  email: string | null;
  status: UserStatus | string;
  phone_verified_at: Date | null;
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class UserModel implements IUser {
  id!: string | number;
  name!: string;
  phone: string | null = null;
  email: string | null = null;
  status: UserStatus | string = UserStatus.PENDING;
  phone_verified_at: Date | null = null;
  email_verified_at: Date | null = null;
  created_at: Date = new Date();
  updated_at: Date = new Date();

  constructor(partial?: Partial<IUser>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
