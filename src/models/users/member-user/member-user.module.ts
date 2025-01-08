import { Module } from '@nestjs/common';
import { MemberUserService } from './member-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberUser } from './entities/member-user.entity';
import { TenantModule } from 'src/models/tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([MemberUser]), TenantModule],
  controllers: [],
  providers: [MemberUserService],
  exports: [MemberUserService],
})
export class MemberUserModule {}
