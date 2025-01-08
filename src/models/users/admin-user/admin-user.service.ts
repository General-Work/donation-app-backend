import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from './entities/admin-user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService } from 'src/lib/base-service';
import { encodedPassword } from 'src/lib/utils';
import { TenantService } from 'src/models/tenant/tenant.service';
import { PaginationOptions } from 'src/lib/paginate-service';

@Injectable()
export class AdminUserService extends BaseService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    private readonly tenantService: TenantService,
  ) {
    super();
  }
  async findOneByUsername(username: string) {
    return this.adminUserRepository.findOne({
      where: { username },
      relations: ['tenant']
    });
  }

  async create(data: CreateAdminUserDto, createdBy: string = '') {
    const password = 'Pass159';
    const user = new AdminUser();
    user.name = data.name;
    user.role = data.role;
    user.username = data.username;
    user.password = encodedPassword(password);
    user.createdBy = createdBy;
    user.updatedBy = createdBy;
    if (data.tenantId) {
      const tenant = await this.tenantService.findOne(data.tenantId);
      if (tenant.data) user.tenant = tenant.data;
    }

    const ret = await this.adminUserRepository.save(user);

    if (ret) {
      try {
        await this.sendMail(
          user.username,
          'Account Creation!',
          ``,
          `
              <div>
              <p>Hello ${data.name}, your account has been successfully created. Below are the details</p>
                <ul>
                <li><strong>Username: ${ret.username}</strong></li>
                <li><strong>Password: ${password}</strong></li>
                </ul>
                <p>NOTE: Do not share this with anyone.</p>
              </div>
              `,
        );
      } catch (emailError) {
        // console.error('Error sending email:', emailError);
        return Error('Failed to send OTP email. Please try again later.');
      }

      return {
        success: true,
        message: 'Admin created successfully',
      };
    }
  }

  findAll(option: PaginationOptions, tenantId?: string) {
    return this.paginateQuery({
      ...option,

      repository: this.adminUserRepository,
      filter: { tenant: { id: tenantId } },
    });
  }


  findOne(id: string) {
    return this.queryResult(
      this.adminUserRepository.findOne({ where: { id } }),
    );
  }

  async update(id: string, data: UpdateAdminUserDto, createdBy: string) {
    const User = await this.adminUserRepository.findOne({ where: { id } });
    User.updatedBy = createdBy;
    if (!User) {
      throw new NotFoundException('User not found');
    }
    Object.assign(User, data);
    return this.callResult(
      this.adminUserRepository.save(User),
      'Successfully updated user',
    );
  }

  async remove(id: string, updateBy: string) {
    const tenant = await this.findOne(id);
    if (!tenant.data) {
      throw new NotFoundException('User not found');
    }
    tenant.data.updatedBy = updateBy;
    return this.callResult(
      this.adminUserRepository.remove(tenant.data),
      'Successfully deleted user',
    );
  }

  async activateUser(id: string, updateBy: string) {
    const existingUser = await this.adminUserRepository.findOne({
      where: { id: id }, // Adjust the field based on your unique constraint
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    existingUser.active = true;
    existingUser.updatedBy = updateBy;
    return this.callResult(
      this.adminUserRepository.update(existingUser.id, existingUser),
      'Successfully activated user',
    );
  }

  async deactivateUser(id: string, updateBy: string) {
    const existingUser = await this.adminUserRepository.findOne({
      where: { id: id }, // Adjust the field based on your unique constraint
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    existingUser.active = false;
    existingUser.updatedBy = updateBy;
    return this.callResult(
      this.adminUserRepository.update(existingUser.id, existingUser),
      'Successfully activated user',
    );
  }

  async saveUser(data: AdminUser) {
    const admin = await this.findOne(data.id);
    return this.callResult(
      this.adminUserRepository.update(admin.data.id, data),
      'Successfully updated admin',
    );
  }
}
