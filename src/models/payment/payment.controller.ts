import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ConfirmAccountDto,
  ConfirmOtpDto,
  CreatePaymentDto,
  MailPaymentDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Request } from 'express';
import { ApiQuery } from '@nestjs/swagger';
import { Data_Sort } from 'src/lib/paginate-service';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib/utils';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { Payment_Status } from 'src/lib/constants';

type Data = {
  id?: number;
  domain?: string;
  status?: string;
  reference?: string;
  amount?: number;

  gateway_response?: string;
  paid_at?: string;
  created_at?: string;
  channel?: string;
  currency?: string;
  ip_address?: string;
  metadata?: any;

  message?: any;
  fees: any;
  log: any;
  customer: any;
  authorization: any;
  plan: any;
};

type PaystackWebhookDto = {
  event: string;
  data: Data;
};

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @UseGuards(JwtGuard)
  @Post()
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'user Id',
  })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Query('userId') id: string,
  ) {
    return this.paymentService.create(createPaymentDto, id || '');
  }

  @UseGuards(JwtGuard)
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start Date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End Date',
  })
  @ApiQuery({
    name: 'donationTypeId',
    required: false,
    type: String,
    description: 'Donation Type',
  })
  @ApiQuery({
    name: 'memberId',
    required: false,
    type: String,
    description: 'memberId',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    type: String,
    description: 'tenantId',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: Data_Sort,
    description: 'Order by column',
    example: Data_Sort.updatedAt_desc,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Payment_Status,
    description: 'Order by column',
    example: Payment_Status.paid,
  })
  findAll(
    @Query('tenantId') id: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('donationTypeId') donationId: string,
    @Query('memberId') memberId: string,
    @Query('sort') sort: Data_Sort,
    @Query('status') status: Payment_Status,
    @Req() req: Request,
  ) {
    const paginate = getPaginationParams(req);
    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: {},
      order: [],
      routeName: paginate.routeName,
      path: paginate.path,
      query: paginate.query,
      dateRange: null,
    };
    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
      if (status) {
        options.filter = {
          status: { operator: '=', value: status },
        };
      }
      if (startDate && endDate) {
        options.dateRange = {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        };
      }

      return this.paymentService.findAll(options, id, memberId, donationId);
    } catch (error) {
      return { error: error.message };
    }
  }

  // @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Get('/verify/:transactionReference')
  async getPayment(@Param('transactionReference') id: string) {
    return this.paymentService.verifyTransaction(id);
  }

  @Get('/callback')
  async verifyTransaction(@Query() query: any) {
    console.log({ query });
    return true;
    // return await this.tenantsPaymentsService.verifyTransaction(query);
  }

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async paymentWebhookHandler(
    @Body() dto: PaystackWebhookDto,
    @Headers() headers = {},
  ) {
    const result = await this.paymentService.handlePaystackWebhook(dto);

    if (!result) {
      throw new BadRequestException();
    }
  }

  @Post('confirm-payment-otp')
  async confirmOtp(@Body() data: ConfirmOtpDto) {
    return this.paymentService.confirmOtp(data.otp, data.transactionReference);
  }

  @Post('verify-payment-account')
  async confirmAccount(@Body() data: ConfirmAccountDto) {
    return this.paymentService.confirmAccount(data.accountNumber, data.code);
  }

  @Post('all-payments')
  async getPayments(@Body() data: MailPaymentDto) {
    // console.log({ data });
    return this.paymentService.generatePaymentDetails(data.userId, data.email);
  }
}
