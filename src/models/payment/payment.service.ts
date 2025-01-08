import {
  BadRequestException,
  HttpCode,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseService } from 'src/lib/base-service';
import { MemberUserService } from '../users/member-user/member-user.service';
import { Payment } from './entities/payment.entity';
import { DonationService } from '../donation/donation.service';
import axios, { HttpStatusCode } from 'axios';
import { PAYMENT_OPTIONS, Payment_Status } from 'src/lib/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MemberUser } from '../users/member-user/entities/member-user.entity';
import { Donation } from '../donation/entities/donation.entity';
import { PaginationOptions } from 'src/lib/paginate-service';
import { MailerService } from '@nestjs-modules/mailer';
import * as PDFDocument from 'pdfkit';
// import * as PDFDocumentTable from 'pdfkit-table';
// import 'pdfkit-table';
import * as fs from 'fs';
import * as path from 'path';
import * as dayjs from 'dayjs';
import { getProviderCode } from 'src/lib/utils';

const PDFDocumentTable = require('pdfkit-table');

interface IntializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: 'pay_offline' | 'send_otp';
    display_text: string;
  };
}

export interface IPaymentStatus {
  status: boolean;
  message: string;
  data: {
    message:
      | 'LOW_BALANCE_OR_PAYEE_LIMIT_REACHED_OR_NOT_ALLOWED'
      | 'Request accepted, authorization in progress';
    reference: string;
    amount: number;
    status: 'failed' | 'ongoing';
  };
}

@Injectable()
export class PaymentService extends BaseService {
  private readonly api = 'https://payment-service-dxnw.onrender.com/api/v1';

  constructor(
    private readonly memberService: MemberUserService,
    private readonly donationService: DonationService,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly mailerService: MailerService,
  ) {
    super();
  }

  async generatePaymentDetails(memberId: string, email: string) {
    try {
      // Fetch member details
      const member = await this.memberService.findOne(memberId);

      if (!member?.data) {
        throw new NotFoundException('Member not found');
      }

      // Fetch payment details
      const payments = await this.paymentRepository.find({
        where: { user: { id: memberId }, status: Payment_Status.paid },
        relations: ['donation', 'donation.tenant'],
        order: { updatedAt: 'DESC' },
      });

      if (!payments || payments.length === 0) {
        throw new Error('No payment records found');
      }

      // Map payment details
      const paymentDetails = payments.map((payment, index) => ({
        '#': index + 1,
        Date: dayjs(payment.updatedAt).format('DD/MM/YYYY'),
        Amount: payment.amount.toFixed(2),
        Donation: payment.donation?.name || 'N/A',
        Reference: payment.transactionReference,
        // Status: payment.status,
      }));

      const pdfPath = path.join(__dirname, 'donation-details.pdf');
      const doc = new PDFDocumentTable({
        size: 'A4',
        bufferPages: true,
        margin: 30,
      });

      doc.pipe(fs.createWriteStream(pdfPath));

      // Add Title
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(`Donations made to ${payments[0].donation?.tenant?.name || ''}`, {
          align: 'center',
        });
      doc.moveDown();

      // Add Date
      doc
        .font('Helvetica')
        .fontSize(12)
        .text(`Date: ${dayjs().format('ddd DD MMMM, YYYY')}`, {
          align: 'right',
        });
      doc.moveDown();

      // Prepare Table Data
      const headers = [
        '#',
        'Date',
        'Amount',
        'Donation',
        'Reference',
        // 'Status',
      ];
      const rows = paymentDetails.map((detail) =>
        headers.map((header) => detail[header]),
      );

      // Add Table
      await doc.table(
        {
          headers,
          rows,
        },
        {
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(10);
            // indexRow % 2 === 0 && doc.addBackground(rectRow, '#f2f2f2', 0.5);
          },
        },
      );

      doc.end();

      // Send Email with PDF attachment
      await this.sendMail(
        email,
        'Donation Details',
        'Please find attached your donation details.',
        null,
        [
          {
            filename: 'donation-details.pdf',
            path: pdfPath,
          },
        ],
      );

      // Ensure the PDF file is deleted after sending the email
      fs.unlinkSync(pdfPath);

      return {
        success: true,
        message: 'Payment details sent successfully',
        status: 200,
      };
    } catch (error) {
      console.error('Error generating payment details:', error);

      return {
        success: false,
        message: error.message || 'An error occurred',
        status: 400,
      };
    }
  }

  async create(dto: CreatePaymentDto, userId = '') {
    const donation = await this.donationService.findOne(dto.donationId);
    if (!donation.data) {
      throw new NotFoundException('Donation not found');
    }

    const amountToPay = dto.amount;
    const user = userId
      ? (await this.memberService.findOne(userId)).data
      : null;

    // console.log({ user });

    // Create payment record
    const payment = this.createPaymentRecord(
      dto,
      donation.data,
      user,
      amountToPay,
    );

    try {
      const paymentResponse = await this.initiatePayment(
        dto,
        user,
        amountToPay,
      );
      // console.log({ paymentResponse: paymentResponse.data });
      if (paymentResponse.data.status) {
        const paymentStatus: IPaymentStatus = await this.verifyTransaction(
          paymentResponse.data.data.reference,
        );

        // console.log({ paymentStatus });

        if (paymentStatus.data.status == 'failed') {
          return {
            success: false,
            message: paymentStatus.data.message,
            code: HttpStatusCode.BadRequest,
          };
        }
        payment.transactionReference = paymentResponse.data.data.reference;
        payment.status = Payment_Status.notPaid;

        return await this.callResult(
          this.paymentRepository.save(payment),
          paymentResponse.data?.data?.display_text ||
            'Check your phone for prompt',
          (d: Payment) => ({
            reference: d.transactionReference,
            id: d.id,
            status: paymentResponse?.data?.data?.status || '',
          }),
        );
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new InternalServerErrorException('Failed to process payment');
    }
  }

  private createPaymentRecord(
    dto: CreatePaymentDto,
    donation: Donation,
    user: MemberUser | null,
    amountToPay: number,
  ) {
    const payment = new Payment();
    payment.isAnonymous = dto.isAnonymous;
    payment.amount = amountToPay;
    payment.donation = donation;
    payment.paymentOption = PAYMENT_OPTIONS.momo;
    payment.momoNumber = dto.phoneNumber;

    if (user !== null) {
      payment.user = user;
    }

    return payment;
  }

  private async initiatePayment(
    dto: CreatePaymentDto,
    user: MemberUser | null,
    amountToPay: number,
  ): Promise<any> {
    // console.log('user', user);
    const paymentData = {
      amount: amountToPay * 100, // Assuming the amount is in GHS
      // amount: amountToPay,
      email: user ? user.username : dto.email,
      currency: 'GHS',
      mobile_money: {
        phone: dto.phoneNumber,
        provider: getProviderCode(dto.phoneNumber),
      },
    };

    const headers = {
      'api-key': process.env.PAYMENT_API_KEY,
    };

    return await axios.post(`${this.api}/payment/momo-pay`, paymentData, {
      headers,
    });
  }

  findAll(
    option: PaginationOptions,
    tenantId?: string,
    memberId?: string,
    donationId?: string,
  ) {
    let filter = {};

    if (tenantId) {
      filter = { donation: { tenant: { id: tenantId } } };
    } else if (memberId) {
      filter = { user: { id: memberId } }; // Correct filter for memberId
    } else {
      throw new BadRequestException();
    }

    if (donationId) {
      filter = {
        ...filter,
        donation: { id: donationId },
      };
    }

    if (option.filter) {
      filter = { ...filter, ...option.filter };

      // console.log(filter);
    }

    return this.paginateQuery({
      ...option,
      repository: this.paymentRepository,
      filter,
      relations: ['donation', 'user'],
    });
  }

  findOne(id: string) {
    return this.queryResult(
      this.paymentRepository.findOne({
        where: { id },
        relations: ['donation', 'user'],
      }),
    );
  }

  async handlePaystackWebhook(dto: any): Promise<boolean> {
    if (!dto.data) {
      return false;
    }

    const transaction = await this.paymentRepository.findOne({
      where: {
        transactionReference: dto.data.reference,
      },
      relations: ['donation', 'donation.tenant', 'user'],
    });

    // const transaction = await this.paymentRepository
    //   .createQueryBuilder('payment')
    //   .where('payment.transactionReference = :reference', {
    //     reference: dto.data.reference,
    //   })
    //   .getOne();

    // console.log({ transaction });

    const transactionStatus = dto.data.status;
    const paymentConfirmed = transactionStatus === 'success';

    if (paymentConfirmed) {
      transaction.status = Payment_Status.paid;
    } else {
      transaction.status = Payment_Status.notPaid;
    }

    try {
      const ret = await this.paymentRepository.update(
        transaction.id,
        transaction,
      );
      // console.log({ ret });

      const res = await this.sendSms(
        transaction.momoNumber,
        `${transaction.donation.tenant.name} sincerely thanks you for your generous donation of GHS ${transaction.amount} in support of ${transaction.donation.name}.`,
      );
      // console.log({ res });
    } catch (error) {
      console.log(error);
    }

    return true;
  }

  async confirmOtp(otp: number, reference: string) {
    try {
      const { data } = await axios.post(
        `${this.api}/payment/confirm-otp`,
        {
          otp,
          reference,
        },
        {
          headers: {
            'api-key': process.env.PAYMENT_API_KEY,
          },
        },
      );
      return data;
    } catch (error) {}
  }

  async confirmAccount(accountNumber: string, code: string) {
    try {
      const { data } = await axios.post(
        `${this.api}/payment/confirm-account`,
        {
          accountNumber,
          bankCode: code,
        },
        {
          headers: {
            'api-key': process.env.PAYMENT_API_KEY,
          },
        },
      );
      return data;
    } catch (error) {}
  }

  async getBanks() {
    try {
      const { data } = await axios.get(
        `${this.api}/payment/banks`,

        {
          headers: {
            'api-key': process.env.PAYMENT_API_KEY,
          },
        },
      );
      return data;
    } catch (error) {}
  }

  async tenantTotalPaymentAmount(id: string, year?: number): Promise<number> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalAmount') // Sum the payment amounts
      .innerJoin('payment.donation', 'donation') // Join with donation
      .where('donation.tenantId = :tenantId', { tenantId: id }) // Filter by tenant ID
      .andWhere('payment.status = :status', { status: Payment_Status.paid }); // Filter by status "paid"

    if (year) {
      queryBuilder.andWhere('YEAR(payment.updatedAt) = :year', { year });
    }

    const result = await queryBuilder.getRawOne();

    return parseFloat(result.totalAmount || '0');
  }

  async tenantDonationsAmount(
    tenantId: string,
    year?: number,
  ): Promise<Record<string, string>> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .select('donation.name', 'donationName') // Select donation name
      .addSelect('SUM(payment.amount)', 'totalAmount') // Sum of amounts
      .innerJoin('payment.donation', 'donation') // Join with donation
      .where('donation.tenantId = :tenantId', { tenantId }) // Filter by tenant ID
      .andWhere('payment.status = :status', { status: 'paid' }); // Filter by status "paid"

    if (year) {
      queryBuilder.andWhere('YEAR(payment.updatedAt) = :year', { year });
    }

    queryBuilder.groupBy('donation.name'); // Group by donation name

    const results = await queryBuilder.getRawMany();

    const donationAmounts: Record<string, string> = {};
    results.forEach((result) => {
      donationAmounts[result.donationName] = parseFloat(
        result.totalAmount,
      ).toFixed(2);
    });

    return donationAmounts;
  }

  async getDonationAmountsByMonth(
    tenantId: string,
    year?: number,
  ): Promise<any[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .select('donation.name', 'donationName') // Select donation name
      .addSelect('MONTH(payment.updatedAt)', 'month') // Extract month
      .addSelect('SUM(payment.amount)', 'totalAmount') // Sum of amounts
      .innerJoin('payment.donation', 'donation') // Join with donation
      .where('donation.tenantId = :tenantId', { tenantId }) // Filter by tenant ID
      .andWhere('payment.status = :status', { status: Payment_Status.paid }); // Only "paid" payments

    if (year) {
      queryBuilder.andWhere('YEAR(payment.updatedAt) = :year', { year }); // Filter by year if provided
    }

    queryBuilder
      .groupBy('donation.name')
      .addGroupBy('MONTH(payment.updatedAt)') // Group by month
      .orderBy('month', 'ASC'); // Sort by month

    return await queryBuilder.getRawMany();
  }

  async verifyTransaction(reference: string) {
    try {
      const { data } = await axios.get(
        `${this.api}/payment/confirm-payment`,

        {
          params: {
            reference,
          },
          headers: {
            'api-key': process.env.PAYMENT_API_KEY,
          },
        },
      );
      return data;
    } catch (error) {
      return {
        success: false,
        message: error?.message || error,
        code: HttpStatusCode.BadRequest,
      };
    }
  }
}
