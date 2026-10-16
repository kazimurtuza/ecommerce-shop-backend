export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  APPLE = 'apple',
}

export interface ISocialAccount {
  id: string | number;
  user_id: string | number;
  provider: SocialProvider | string;
  provider_account_id: string;
  email: string | null;
  created_at: Date;
  updated_at: Date;
}

export class SocialAccountModel implements ISocialAccount {
  id!: string | number;
  user_id!: string | number;
  provider!: SocialProvider | string;
  provider_account_id!: string;
  email: string | null = null;
  created_at: Date = new Date();
  updated_at: Date = new Date();

  constructor(partial?: Partial<ISocialAccount>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
