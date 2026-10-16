import { SocialProvider } from '../models/social-account.model';

export interface LinkSocialAccountDto {
  user_id: string | number;
  provider: SocialProvider | string;
  provider_account_id: string;
  email?: string | null;
}
