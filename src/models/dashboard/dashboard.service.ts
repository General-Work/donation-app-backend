import { Injectable } from '@nestjs/common';
import { AdminUserService } from '../users/admin-user/admin-user.service';
import { MemberUserService } from '../users/member-user/member-user.service';
import { PaymentService } from '../payment/payment.service';
import { BaseService } from 'src/lib/base-service';
import { PaginationOptions } from 'src/lib/paginate-service';

@Injectable()
export class DashboardService extends BaseService {
  constructor(
    private readonly adminUser: AdminUserService,
    private readonly memberUser: MemberUserService,
    private readonly paymentService: PaymentService,
  ) {
    super();
  }
  async tenantCounts(tenantId: string, year?: number) {
    try {
      const users = await this.memberUser.getAllTenantUsersCount(tenantId);
      const totalPayments = await this.paymentService.tenantTotalPaymentAmount(
        tenantId,
        year,
      );

      const donations = await this.paymentService.tenantDonationsAmount(
        tenantId,
        year,
      );

      const donationCharts =
        await this.paymentService.getDonationAmountsByMonth(tenantId, year);
      return {
        success: true,
        message: '',
        data: {
          members: users.toString(),
          totalPayments: totalPayments.toFixed(2),
          donations,
          donationCharts,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || error,
      };
    }
  }

  getMembers(option: PaginationOptions, tenantId: string) {
    return this.memberUser.getMembers(option, tenantId);
  }
}
