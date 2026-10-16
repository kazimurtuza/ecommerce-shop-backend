export interface IUserSession {
  id: string | number;
  user_id: string | number;
  refresh_token_hash: string;
  device_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export class UserSessionModel implements IUserSession {
  id!: string | number;
  user_id!: string | number;
  refresh_token_hash!: string;
  device_name: string | null = null;
  ip_address: string | null = null;
  user_agent: string | null = null;
  expires_at!: Date;
  revoked_at: Date | null = null;
  created_at: Date = new Date();

  constructor(partial?: Partial<IUserSession>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
