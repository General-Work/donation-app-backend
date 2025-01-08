import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { MemberUserModule } from '../users/member-user/member-user.module';
import { DonationModule } from '../donation/donation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    MemberUserModule,
    DonationModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
