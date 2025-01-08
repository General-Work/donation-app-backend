import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { User_Role } from 'src/lib/constants';

export class CreateAdminUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @ApiProperty({
    description: 'Username',
    example: 'username',
    required: true,
    type: String,
  })
  username: string;

  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @ApiProperty({
    description: 'name',
    example: 'name',
    required: true,
    type: String,
  })
  name: string;

  @IsNotEmpty({ message: 'role is required' })
  @IsEnum(User_Role, { message: 'Invalid role type' }) // Use IsEnum for validation
  @ApiProperty({
    description: 'role type',
    example: User_Role.Developer, // Provide an example from your enum
    required: true,
    enum: User_Role, // Use enum to document it properly in Swagger
  })
  role: User_Role;

  @IsString()
  @ApiProperty({
    description: 'tenant Id',
    example: 'tenant Id',
    required: false,
    type: String,
  })
  tenantId: string;
}
