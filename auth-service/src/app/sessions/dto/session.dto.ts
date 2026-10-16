export interface CreateSessionDto {
  user_id: string | number;
  refresh_token_hash: string;
  device_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  expires_at: Date | string;
}

export interface RevokeSessionDto {
  session_id: string | number;
  user_id?: string | number;
}
