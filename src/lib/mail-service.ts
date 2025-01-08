import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendMail(
    email: string,
    subject: string,
    text: string,
    html?: any,
    attachments?: any,
  ): Promise<string | undefined | null> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail as the email service
        auth: {
          user: process.env.GMAIL_USER, // Your Gmail address
          pass: process.env.GMAIL_PASSWORD, // Your Gmail password or App Password
        },
      });

      const message = {
        from: process.env.GMAIL_USER, // Sender's email address
        to: email, // Recipient's email address
        subject,
        text,
        html,
        attachments,
      };

      const res = await transporter.sendMail(message);
      return res?.messageId; // Return the message ID
    } catch (err) {
      console.error('Error sending email:', err); // Log any errors
    }
  }
}
