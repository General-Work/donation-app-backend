import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  CreateAuthDto,
  VerifyOtpDto,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateMemberUserDto } from '../users/member-user/dto/create-member-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CreateAuthDto })
  @Post('login')
  async login(@Request() req) {
    const ret = await this.authService.login(req.user);
    return ret;
  }

  @Post('create-member')
  @ApiBody({ type: CreateMemberUserDto })
  async createMember(@Body() data: CreateMemberUserDto) {
    return this.authService.createMember(data);
  }

  @ApiQuery({
    name: 'username',
    required: true,
    type: String,
    description: 'username',
  })
  @Get('get-otp')
  async getOtp(@Query('username') username: string) {
    return this.authService.getOtp(username);
  }

  @ApiBody({ type: VerifyOtpDto })
  @Post('verify-otp')
  async verifyAccount(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOtp(data.username, data.otp);
  }

  @Post('add-new-password')
  @ApiBody({ type: ChangePasswordDto })
  async newPassword(@Body() data: ChangePasswordDto) {
    return this.authService.changePassword(data.username, data.password);
  }
}
