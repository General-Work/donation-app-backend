import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User_Role } from 'src/lib/constants';
import { BaseService } from 'src/lib/base-service';
import { JwtService } from '@nestjs/jwt';
import { AdminUserService } from '../users/admin-user/admin-user.service';
import { MemberUserService } from '../users/member-user/member-user.service';
import { comparePasswords, encodedPassword } from 'src/lib/utils';
import { MemberUser } from '../users/member-user/entities/member-user.entity';
import * as dayjs from 'dayjs';
import { CreateMemberUserDto } from '../users/member-user/dto/create-member-user.dto';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private jwtService: JwtService,

    private readonly adminUserService: AdminUserService,
    private readonly memberUserService: MemberUserService,
  ) {
    super();
  }
  async validateUser(username: string, password: string): Promise<any> {
    const user =
      (await this.adminUserService.findOneByUsername(username)) ||
      (await this.memberUserService.findUserByPhone(username));

    if (user) {
      if (user.role !== User_Role.Client) {
        const { password: storedPassword, role, ...rest } = user;
        const isPasswordValid = comparePasswords(password, storedPassword);

        if (!isPasswordValid) {
          return null;
        }
        return { role, ...rest };
      }

      // console.log('......here,,,,,');

      const { otp: storedPassword, role, otpExpiry, ...rest } = user;

      const isValidOtp = comparePasswords(password, storedPassword);

      // console.log({ isValidOtp });

      if (!isValidOtp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (otpExpiry && dayjs().isAfter(dayjs(otpExpiry))) {
        throw new BadRequestException('OTP has expired');
      }

      const newUser = user as MemberUser;
      if (!newUser.hasVerifiedAccount) {
        return null;
      }
      return {
        user: newUser,
        email: newUser.username,
        username: newUser.username,
        hasVerifiedAccount: newUser.hasVerifiedAccount,
        tenantId: newUser?.tenant.id,
        tenant: newUser?.tenant,
        role: newUser.role,
        name: newUser.name,
        active: newUser?.active,
        phoneNumber: newUser.phoneNumber,
      };
    }
  }

  async login(user: any) {
    const { username, id, role, email, tenant, ...rest } = user;

    const payload = {
      username: role === User_Role.Client ? email : username,
      id,
      sub: {
        username: role === User_Role.Client ? email : username,
      },
      tenantId:
        role === User_Role.Admin || role === User_Role.Client
          ? tenant?.id
          : role === User_Role.SuperAdmin
            ? tenant?.id
            : null,
    };

    return {
      username,
      id,
      role,
      tenant,
      ...rest,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
  }

  async getOtp(username: string) {
    // await this.sendSms('0245414935', 'Hii Kobby');
    // return true;
    const user =
      (await this.adminUserService.findOneByUsername(username)) ||
      (await this.memberUserService.findUserByPhone(username));

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const currentTime = new Date();
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = encodedPassword(otp.toString());
    user.otpExpiry = new Date(currentTime.getTime() + 10 * 60 * 1000);
    let action: any;

    if (user.role === User_Role.Client) {
      await this.memberUserService.saveUser(user as any);
      const d = user as MemberUser;
      action = this.sendSms(d.phoneNumber, `OTP: ${otp}`);
    } else {
      await this.adminUserService.saveUser(user as any);
      action = this.sendMail(
        user.username,
        'Welcome to Donation App!',
        'OTP to reset your password.',
        `<strong>OTP:</strong> ${otp} <br/><span>Don't share this with anyone</span>`,
      );
    }

    try {
      await action;
    } catch (emailError) {
      // console.error('Error sending email:', emailError);
      return Error('Failed to send OTP email. Please try again later.');
    }
    return {
      success: true,
      message: `OTP sent to ${user.username}`,
    };
  }

  async verifyOtp(username: string, otp: string) {
    const user =
      (await this.adminUserService.findOneByUsername(username)) ||
      (await this.memberUserService.findUserByPhone(username));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { otp: storedOtp, otpExpiry } = user;

    const isValidOtp = comparePasswords(otp, storedOtp);

    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otpExpiry && dayjs().isAfter(dayjs(otpExpiry))) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.role === User_Role.Client) {
      user['hasVerifiedAccount'] = true;
      await this.memberUserService.saveUser(user as any);
    }

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }

  async changePassword(username: string, password: string) {
    const user =
      (await this.adminUserService.findOneByUsername(username)) ||
      (await this.memberUserService.findUserByPhone(username));

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = encodedPassword(password);

    if (user.role === User_Role.Client) {
      user['hasVerifiedAccount'] = true;
      return this.memberUserService.saveUser(user as any);
    } else {
      user['hasResetPassword'] = true;
      return this.adminUserService.saveUser(user as any);
    }
  }

  async createMember(data: CreateMemberUserDto) {
    return this.memberUserService.create(data);
  }
}
