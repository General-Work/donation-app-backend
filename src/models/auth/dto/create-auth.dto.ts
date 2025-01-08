import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @ApiProperty({
    description: 'Username',
    example: 'username',
    required: true,
    type: String,
  })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @ApiProperty({
    description: 'Password',
    example: 'password',
    required: true,
    type: String,
  })
  password: string;
}

export class RefreshDto {
  @IsNotEmpty({ message: 'Refresh cannot be empty' })
  @IsString({ message: 'Refresh must be a string' })
  @ApiProperty({
    description: 'Refresh token of the user',
    example: 'string',
    required: true,
    type: String,
  })
  refresh: string;
}

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  @ApiProperty({
    description: 'username',
    example: 'username',
    required: true,
    type: String,
  })
  username: string;

  @IsNotEmpty({ message: 'otp is required' })
  @IsString()
  @ApiProperty({
    description: 'otp',
    example: 'otp',
    required: true,
    type: String,
  })
  otp: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  @ApiProperty({
    description: 'username',
    example: 'username',
    required: true,
    type: String,
  })
  username: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  @ApiProperty({
    description: 'password',
    example: 'password',
    required: true,
    type: String,
  })
  password: string;
}
