import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { Donation } from './entities/donation.entity';
import { BaseService } from 'src/lib/base-service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationOptions } from 'src/lib/paginate-service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class DonationService extends BaseService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    private readonly tenantService: TenantService,
  ) {
    super();
  }
  async create(data: CreateDonationDto, createdBy: string, tenantId: string) {
    const tenant = await this.tenantService.findOne(tenantId);
    if (!tenant.data) {
      throw new NotFoundException('Tenant not found');
    }
    const donation = new Donation();
    donation.name = data.name;
    donation.purpose = data.purpose;
    donation.type = data.type;
    donation.tenant = tenant.data;
    if (data.startDate) donation.startDate = new Date(data.startDate);
    if (data.endDate) donation.endDate = new Date(data.endDate);
    donation.createdBy = createdBy;
    donation.updatedBy = createdBy;

    return this.callResult(
      this.donationRepository.save(donation),
      'Successfully added donation',
    );
  }

  findAll(option: PaginationOptions, tenantId: string) {
    return this.paginateQuery({
      ...option,
      repository: this.donationRepository,
      filter: { tenant: { id: tenantId } },
    });
  }

  findOne(id: string) {
    return this.queryResult(this.donationRepository.findOne({ where: { id }, relations: ['tenant'] }));
  }

  async update(id: string, data: UpdateDonationDto, createdBy = '') {
    const tenant = await this.donationRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Donation not found');
    }
    tenant.updatedBy = createdBy;
    tenant.name = data.name;
    tenant.purpose = data.purpose;
    tenant.type = data.type;
    if (data.startDate) tenant.startDate = new Date(data.startDate);
    if (data.endDate) tenant.endDate = new Date(data.endDate);

    return this.callResult(
      this.donationRepository.update(tenant.id, tenant),
      'Successfully updated donation',
    );
  }

  async remove(id: string, createdBy: string) {
    const tenant = await this.findOne(id);
    if (!tenant.data) {
      throw new NotFoundException('donation not found');
    }
    tenant.data.updatedBy = createdBy;
    return this.callResult(
      this.donationRepository.remove(tenant.data),
      'Successfully deleted donation',
    );
  }
}
