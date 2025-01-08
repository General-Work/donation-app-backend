import { Injectable, HttpStatus } from '@nestjs/common';
import { PaginationOptions, PaginationService } from './paginate-service';
import { SMSSerive } from './sms-service';
import { MailService } from './mail-service';

@Injectable()
export class BaseService extends PaginationService {
  // This function accepts the operation (Promise) and success message, and returns the standardized result
  async callResult<T>(
    operation: Promise<T>,
    successMessage: string,
    mapper?: (d: any) => any,
  ) {
    try {
      const res = await operation; // Execute the operation (e.g., repository save)
      if (mapper) {
        const response = mapper(res);
        return {
          code: HttpStatus.OK,
          success: true,
          message: successMessage,
          data: response,
        };
      }
      return {
        code: HttpStatus.OK,
        success: true,
        message: successMessage,
      };
    } catch (error) {
      console.log({ error });
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error?.message || 'Unknown error occurred',
      };
    }
  }

  async queryResult<T>(operation: Promise<T>, successMessage = '') {
    try {
      const result = await operation; // Execute the operation (e.g., repository find)
      return {
        code: HttpStatus.OK,
        success: true,
        message: successMessage,
        data: result, // Include the retrieved data in the response
      };
    } catch (error) {
      // console.log({ error });
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error?.message || 'Unknown error occurred',
      };
    }
  }

  async paginateQuery(operations: PaginationOptions) {
    try {
      const result = await this.paginate(operations);
      return {
        code: HttpStatus.OK,
        success: true,
        message: '',
        data: result, // Include the retrieved data in the response
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error?.message || 'Unknown error occurred',
      };
    }
  }

  async sendSms(destination: string, message: string) {
    const sms = new SMSSerive();
    return await sms.send(destination, message);
  }

  async sendMail(
    email: string,
    subject: string,
    text: string,
    html?: any,
    attachments?: any,
  ) {
    const mail = new MailService();
    return mail.sendMail(email, subject, text, html, attachments);
  }
}
