import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { BaseService } from 'src/lib/base-service';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { Repository } from 'typeorm';
import { PaginationOptions } from 'src/lib/paginate-service';

@Injectable()
export class TenantService extends BaseService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {
    super();
  }
  create(data: CreateTenantDto, createdBy: string) {
    const tenant = new Tenant();
    tenant.email = data.email;
    tenant.gpsAddress = data.gpsAddress;
    tenant.location = data.location;
    tenant.name = data.name;
    tenant.createdBy = createdBy;
    tenant.updatedBy = createdBy;
    return this.callResult(
      this.tenantRepository.save(tenant),
      'Successfully created tenant',
    );
  }

  findAll(option: PaginationOptions) {
    return this.paginateQuery({
      ...option,
      repository: this.tenantRepository,
    });
  }

  findOne(id: string) {
    return this.queryResult(this.tenantRepository.findOne({ where: { id } }));
  }

  async update(id: string, data: UpdateTenantDto, updatedBy: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.updatedBy = updatedBy;
    Object.assign(tenant, data);
    return this.callResult(
      this.tenantRepository.save(tenant),
      'Successfully updated tenant',
    );
  }

  async remove(id: string, updateBy: string) {
    const tenant = await this.findOne(id);
    if (!tenant.data) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.data.updatedBy = updateBy;
    return this.callResult(
      this.tenantRepository.remove(tenant.data),
      'Successfully deleted tenant',
    );
  }

  async activateUser(id: string, updateBy: string) {
    const existingUser = await this.tenantRepository.findOne({
      where: { id: id }, // Adjust the field based on your unique constraint
    });

    if (!existingUser) {
      throw new NotFoundException('Tenant not found');
    }

    existingUser.active = true;
    existingUser.updatedBy = updateBy;
    return this.callResult(
      this.tenantRepository.update(existingUser.id, existingUser),
      'Successfully activated tenant',
    );
  }

  async deactivateUser(id: string, updateBy: string) {
    const existingUser = await this.tenantRepository.findOne({
      where: { id: id }, // Adjust the field based on your unique constraint
    });

    if (!existingUser) {
      throw new NotFoundException('Tenant not found');
    }

    existingUser.active = false;
    existingUser.updatedBy = updateBy;
    return this.callResult(
      this.tenantRepository.update(existingUser.id, existingUser),
      'Successfully activated tenant',
    );
  }

  async getActiveTenants() {
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');
  
    return queryBuilder
      .where('tenant.active = :active', { active: true })
      .getMany();
  }
  
}
