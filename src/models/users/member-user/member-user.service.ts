import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberUserDto } from './dto/create-member-user.dto';
import { UpdateMemberUserDto } from './dto/update-member-user.dto';
import { BaseService } from 'src/lib/base-service';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberUser } from './entities/member-user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { encodedPassword } from 'src/lib/utils';
import { TenantService } from 'src/models/tenant/tenant.service';
import { User_Role } from 'src/lib/constants';
import { PaginationOptions } from 'src/lib/paginate-service';

@Injectable()
export class MemberUserService extends BaseService {
  constructor(
    @InjectRepository(MemberUser)
    private readonly userRepository: Repository<MemberUser>,
    private readonly tenantService: TenantService,
  ) {
    super();
  }

  async findUserByPhone(phoneNumber: string) {
    return this.userRepository.findOne({
      where: { phoneNumber },
      relations: ['tenant'],
    });
  }

  async saveUser(data: MemberUser) {
    const admin = await this.findOne(data.id);
    return this.callResult(
      this.userRepository.update(admin.data.id, data),
      'Succesfully updated member',
    );
  }

  getAllTenantUsersCount(id: string) {
    return this.userRepository.count({ where: { tenant: { id } } });
  }

  getAllTenantUsers(id: string) {
    return this.queryResult(
      this.userRepository.find({ where: { tenant: { id } } }),
    );
  }

  async create(data: CreateMemberUserDto) {
    const tenant = await this.tenantService.findOne(data.tenantId);

    if (!tenant.data) {
      throw new NotFoundException('Tenant not found');
    }

    const currentTime = new Date();
    const member = new MemberUser();
    member.name = data.name;
    member.username = data.email;
    member.phoneNumber = data.phoneNumber;
    // member.password = encodedPassword(data.password);
    const otp = Math.floor(1000 + Math.random() * 9000);
    member.otp = encodedPassword(otp.toString());
    member.otpExpiry = new Date(currentTime.getTime() + 10 * 60 * 1000);
    member.tenant = tenant.data;
    member.role = User_Role.Client;
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(MemberUser, member);

      // const ret = await this.sendMail(
      //   data.email,
      //   `Welcome to ${tenant.data.name}!`,
      //   ``,
      //   `<div>
      //   <strong>OTP:</strong> ${otp} <br/><span>Don't share this with anyone</sapn>
      //   </div>`,
      // );

      const ret = await this.sendSms(
        member.phoneNumber,
        `Welcome to ${tenant.data.name},/n your verification OTP is: ${otp}`,
      );
      if (ret) {
        await queryRunner.commitTransaction();

        return {
          message: 'Verify your account',
          status: HttpStatus.CREATED,
          success: true,
        };
      } else {
        await queryRunner.rollbackTransaction();
        throw new Error('Email sending failed.');
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('User with this email already exists.');
      } else {
        throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  findOne(id: string) {
    return this.queryResult(this.userRepository.findOne({ where: { id } }));
  }

  update(id: number, updateMemberUserDto: UpdateMemberUserDto) {
    return `This action updates a #${id} memberUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} memberUser`;
  }

  async getMembers(option: PaginationOptions, tenantId: string) {
    const ret = await this.paginateQuery({
      ...option,
      repository: this.userRepository,
      filter: { tenant: { id: tenantId } },
    });
    // console.log(ret);
    return ret;
  }
}
