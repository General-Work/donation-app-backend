import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AdminUserModule } from '../users/admin-user/admin-user.module';
import { MemberUserModule } from '../users/member-user/member-user.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [AdminUserModule, MemberUserModule, PaymentModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
