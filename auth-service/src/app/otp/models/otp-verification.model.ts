export enum OtpPurpose {
  REGISTER = 'register',
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset',
  PHONE_VERIFICATION = 'phone_verification',
  EMAIL_VERIFICATION = 'email_verification',
}

export interface IOtpVerification {
  id: string | number;
  user_id: string | number | null;
  phone: string;
  otp_hash: string;
  purpose: OtpPurpose | string;
  attempts: number;
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}

export class OtpVerificationModel implements IOtpVerification {
  id!: string | number;
  user_id: string | number | null = null;
  phone!: string;
  otp_hash!: string;
  purpose: OtpPurpose | string = OtpPurpose.PHONE_VERIFICATION;
  attempts: number = 0;
  expires_at!: Date;
  verified_at: Date | null = null;
  created_at: Date = new Date();

  constructor(partial?: Partial<IOtpVerification>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
