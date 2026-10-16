export interface IUserRole {
  user_id: string | number;
  role_id: string | number;
  created_at: Date;
}

export class UserRoleModel implements IUserRole {
  user_id!: string | number;
  role_id!: string | number;
  created_at: Date = new Date();

  constructor(partial?: Partial<IUserRole>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
