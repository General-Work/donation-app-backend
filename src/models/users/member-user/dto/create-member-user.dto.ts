import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateMemberUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @ApiProperty({
    description: 'Username',
    example: 'username',
    required: true,
    type: String,
  })
  email: string;

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

  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @ApiProperty({
    description: 'name',
    example: 'name',
    required: true,
    type: String,
  })
  name: string;

  @IsNotEmpty({ message: 'tenant id is required' })
  @IsString()
  @ApiProperty({
    description: 'tenant id',
    example: 'tenant id',
    required: true,
    type: String,
  })
  tenantId: string;

  // @IsNotEmpty({ message: 'Password is required' })
  // @IsString()
  // @ApiProperty({
  //   description: 'Password',
  //   example: 'password',
  //   required: true,
  //   type: String,
  // })
  // password: string;
}
