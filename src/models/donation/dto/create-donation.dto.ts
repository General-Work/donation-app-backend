import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Donation_Type } from 'src/lib/constants';

export class CreateDonationDto {
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @ApiProperty({
    description: 'name',
    example: 'name',
    required: true,
    type: String,
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'purpose',
    example: 'purpose',
    required: false,
    type: String,
  })
  purpose: string;

  @IsString()
  @ApiProperty({
    description: 'start date',
    example: 'start date',
    required: false,
    type: String,
  })
  startDate: string;

  @IsString()
  @ApiProperty({
    description: 'end date',
    example: 'end date',
    required: false,
    type: String,
  })
  endDate: string;

  @IsNotEmpty({ message: 'donation type is required' })
  @IsEnum(Donation_Type, { message: 'Invalid donation type' }) // Use IsEnum for validation
  @ApiProperty({
    description: 'donation type',
    example: Donation_Type.Recurring, // Provide an example from your enum
    required: true,
    enum: Donation_Type, // Use enum to document it properly in Swagger
  })
  type: Donation_Type;
}
