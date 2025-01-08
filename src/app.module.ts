import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { AuthModule } from './models/auth/auth.module';
import { PaymentModule } from './models/payment/payment.module';
import { AdminUserModule } from './models/users/admin-user/admin-user.module';
import { DonationModule } from './models/donation/donation.module';
import { MemberUserModule } from './models/users/member-user/member-user.module';
import { BaseService } from './lib/base-service';
import { ExtractUserMiddleware } from './lib/middlewares/extract-user.middleware';
import { TenantModule } from './models/tenant/tenant.module';
import { DashboardModule } from './models/dashboard/dashboard.module';
import { WithdrawalModule } from './models/withdrawal/withdrawal.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    MailerModule.forRoot({
      transport: {
        // host: 'smtp.example.com',
        // port: 587,
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER, // Your Gmail address
          pass: process.env.GMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.GMAIL_USER}>`,
      },
    }),
    AuthModule,
    PaymentModule,
    AdminUserModule,
    DonationModule,
    MemberUserModule,
    TenantModule,
    DashboardModule,
    WithdrawalModule,
  ],
  controllers: [],
  providers: [BaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractUserMiddleware).forRoutes('*');
  }
}
