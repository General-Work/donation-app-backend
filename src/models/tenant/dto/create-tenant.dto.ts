import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @ApiProperty({
    description: 'name',
    example: 'name',
    required: true,
    type: String,
  })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  @ApiProperty({
    description: 'email',
    example: 'email',
    required: false,
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'gps',
    example: 'gps',
    required: true,
    type: String,
  })
  gpsAddress: string;

  @ApiProperty({
    description: 'location',
    example: 'location',
    required: false,
    type: String,
  })
  location: string;
}
