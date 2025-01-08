import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNotEmpty({ message: 'phone number is required' })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  @ApiProperty({
    description: '',
    example: '0244444444',
    required: true,
    type: String,
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'amount is required' })
  @IsNumber()
  @ApiProperty({
    description: 'amount',
    example: 'amount',
    required: true,
    type: Number,
  })
  amount: number;

  @IsNotEmpty({ message: 'momo name is required' })
  @IsString()
  @ApiProperty({
    description: '',
    example: 'momoName',
    required: true,
    type: String,
  })
  momoName: string;

  @IsNotEmpty({ message: 'reason is required' })
  @IsString()
  @ApiProperty({
    description: '',
    example: 'reason',
    required: true,
    type: String,
  })
  reason: string;
}
