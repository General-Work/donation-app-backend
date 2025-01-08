import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'phone number is required' })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  @ApiProperty({
    description: 'gymId',
    example: '0244444444',
    required: true,
    type: String,
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Donation ID is required' })
  @IsString()
  @ApiProperty({
    description: 'donation id',
    example: '1212S23-2323',
    required: true,
    type: String,
  })
  donationId: string;

  @IsNumber()
  @ApiProperty({
    description: 'amount',
    example: 1.0,
    required: true,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  isAnonymous: boolean;

  @IsString()
  @ApiProperty({
    description: 'optional email',
    example: '',
    required: false,
    type: String,
  })
  email: string;
}

export class ConfirmOtpDto {
  @IsNotEmpty({ message: 'phone number is required' })
  @IsNumber()
  @ApiProperty({
    required: true,
    type: Number,
  })
  otp: number;

  @IsNotEmpty({ message: 'Reference is required' })
  @IsString()
  @ApiProperty({
    required: true,
    type: String,
  })
  transactionReference: string;
}

export class ConfirmAccountDto {
  @IsNotEmpty({ message: 'account number is required' })
  @IsString()
  @ApiProperty({
    required: true,
    type: String,
  })
  accountNumber: string;

  @IsNotEmpty({ message: 'code is required' })
  @IsString()
  @ApiProperty({
    required: true,
    type: String,
  })
  code: string;
}

export class MailPaymentDto {
  @IsNotEmpty({ message: 'email is required' })
  @IsString()
  @ApiProperty({
    required: true,
    type: String,
  })
  email: string;

  @IsNotEmpty({ message: 'userId is required' })
  @IsString()
  @ApiProperty({
    required: true,
    type: String,
  })
  userId: string;
}
