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

  private get apiKey(): string | undefined {
    return process.env.SMS_API_KEY;
  }

  private get senderId(): string | undefined {
    return process.env.SMS_SENDER_ID;
  }

  private get gatewayUrl(): string | undefined {
    return process.env.SMS_GATEWAY_URL;
  }

  /**
   * Check if SMS gateway is properly configured in .env
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.gatewayUrl);
  }

  /**
   * Format phone number (e.g. 01XXXXXXXXX -> 8801XXXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/[\s\-+]/g, '');
    if (clean.startsWith('01') && clean.length === 11) {
      clean = '88' + clean;
    }
    return clean;
  }

  /**
   * Build URL-encoded form data according to gateway parameters
   */
  private buildPayload(phone: string, message: string): URLSearchParams {
    const params = new URLSearchParams();
    const isSmsNetBd = this.gatewayUrl?.includes('sms.net.bd');

    params.append('api_key', this.apiKey || '');

    if (isSmsNetBd) {
      params.append('to', phone);
      params.append('msg', message);
      if (this.senderId) {
        params.append('sender_id', this.senderId);
      }
    } else {
      // BulkSMSBD and standard Bangladeshi SMS gateways
      params.append('number', phone);
      params.append('message', message);
      if (this.senderId) {
        params.append('senderid', this.senderId);
      }
    }

    return params;
  }

  /**
   * Parse gateway response
   */
  private parseResponse(data: any): { success: boolean; message: string; requestId?: string | number } {
    if (!data) {
      return { success: false, message: 'Empty response from SMS gateway' };
    }

    // BulkSMSBD success response code (202)
    if (
      data.response_code === 202 ||
      data.response_code === '202' ||
      (typeof data === 'string' && data.includes('202'))
    ) {
      return {
        success: true,
        message: data.success_message || 'SMS submitted successfully',
      };
    }

    // sms.net.bd success response (error: 0)
    if (data.error === 0 || data.error === '0') {
      return {
        success: true,
        message: data.msg || 'SMS submitted successfully',
        requestId: data.data?.request_id,
      };
    }

    const errorMessage =
      data.error_message ||
      data.msg ||
      (typeof data === 'string' ? data : JSON.stringify(data));

    return {
      success: false,
      message: errorMessage || 'Failed to send SMS',
    };
  }

  /**
   * Send SMS via gateway configured in .env
   */
  async sendSms(to: string, message: string): Promise<SendSmsResult> {
    const formattedPhone = this.formatPhoneNumber(to);
    const { apiKey, gatewayUrl } = this;

    if (!apiKey || !gatewayUrl) {
      this.logger.warn(
        `[SmsService] SMS configuration is missing in .env (SMS_API_KEY or SMS_GATEWAY_URL not set). SMS will not be sent to ${formattedPhone}.`
      );
      return {
        success: false,
        message: 'SMS gateway is not configured in .env',
      };
    }

    try {
      this.logger.log(`[SmsService] Sending SMS to ${formattedPhone}`);

      const params = this.buildPayload(formattedPhone, message);

      const response = await axios.post(gatewayUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      const result = this.parseResponse(response.data);

      if (result.success) {
        this.logger.log(`[SmsService] SMS sent successfully to ${formattedPhone}: ${result.message}`);
        return {
          success: true,
          message: result.message,
          requestId: result.requestId,
        };
      }

      this.logger.error(`[SmsService] SMS gateway returned error: ${result.message}`);
      return {
        success: false,
        message: result.message,
        error: response.data,
      };
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error_message ||
        error?.response?.data?.msg ||
        error?.message ||
        'Error occurred while contacting SMS Gateway';

      this.logger.error(`[SmsService] HTTP error: ${errorMsg}`);
      return {
        success: false,
        message: errorMsg,
        error: error?.response?.data || error?.message,
      };
    }
  }
}
