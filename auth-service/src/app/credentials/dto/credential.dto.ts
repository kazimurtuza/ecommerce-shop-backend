export interface CreateCredentialDto {
  user_id: string | number;
  password_hash: string;
}

export interface ChangePasswordDto {
  user_id: string | number;
  new_password_hash: string;
}

export interface ValidatePasswordDto {
  user_id: string | number;
  password_hash: string;
}
