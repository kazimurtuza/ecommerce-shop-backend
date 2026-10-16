import { OtpPurpose } from '../models/otp-verification.model';

export class SendOtpDto {
  phone!: string;
  purpose!: OtpPurpose | string;
  user_id?: string | number | null;
}

export class VerifyOtpDto {
  phone!: string;
  otp!: string;
  purpose!: OtpPurpose | string;
}

