export interface IUserCredential {
  id: string | number;
  user_id: string | number;
  password_hash: string;
  password_changed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class UserCredentialModel implements IUserCredential {
  id!: string | number;
  user_id!: string | number;
  password_hash!: string;
  password_changed_at: Date | null = null;
  created_at: Date = new Date();
  updated_at: Date = new Date();

  constructor(partial?: Partial<IUserCredential>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
