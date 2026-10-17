import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface SendSmsResult {
  success: boolean;
  message: string;
  requestId?: number | string;
  error?: any;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly endpoint = process.env.SMS_NET_BD_URL || 'https://api.sms.net.bd/sendsms';

  /**
   * Format phone number to clean string.
   * Strips spaces, hyphens, and leading +
   */
  private formatPhoneNumber(phone: string): string {
    return phone.replace(/[\s\-+]/g, '');
  }

  async sendSms(to: string, message: string): Promise<SendSmsResult> {
    const apiKey = process.env.SMS_NET_BD_API_KEY;
    const senderId = process.env.SMS_NET_BD_SENDER_ID;
    const formattedPhone = this.formatPhoneNumber(to);

    if (!apiKey) {
      this.logger.warn(
        `[SmsService] SMS_NET_BD_API_KEY is not set in .env. SMS will NOT be sent to ${formattedPhone}. Message: "${message}"`
      );
      return {
        success: false,
        message: 'SMS Gateway API key is not configured in .env',
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('api_key', apiKey);
      params.append('msg', message);
      params.append('to', formattedPhone);

      if (senderId && senderId.trim() !== '') {
        params.append('sender_id', senderId.trim());
      }

      this.logger.log(`[SmsService] Sending SMS via sms.net.bd to: ${formattedPhone}`);

      const response = await axios.post(this.endpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      const data = response.data;

      // sms.net.bd response structure:
      // { "error": 0, "msg": "Request successfully submitted", "data": { "request_id": 1234 } }
      if (data && (data.error === 0 || data.error === '0')) {
        this.logger.log(
          `[SmsService] SMS sent successfully to ${formattedPhone}. Request ID: ${data.data?.request_id}`
        );
        return {
          success: true,
          message: data.msg || 'Request successfully submitted',
          requestId: data.data?.request_id,
        };
      } else {
        const errorMsg = data?.msg || 'Failed to send SMS via sms.net.bd';
        this.logger.error(`[SmsService] SMS Gateway returned error: ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          error: data,
        };
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.msg || error?.message || 'Error occurred while contacting SMS Gateway';
      this.logger.error(`[SmsService] HTTP error sending SMS: ${errorMsg}`);
      return {
        success: false,
        message: errorMsg,
        error: error?.response?.data || error?.message,
      };
    }
  }
}
