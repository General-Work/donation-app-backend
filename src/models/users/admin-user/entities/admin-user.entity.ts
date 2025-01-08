import { User_Role } from 'src/lib/constants';
import { Tenant } from 'src/models/tenant/entities/tenant.entity';
import { Withdrawal } from 'src/models/withdrawal/entities/withdrawal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: '' })
  otp: string;

  @Column({ default: false })
  hasResetPassword: boolean;

  @Column({ nullable: true })
  otpExpiry: Date;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @Column()
  role: User_Role;

  // @OneToMany(() => TenantUser, (tenant) => tenant.superAdmin)
  // tenants: TenantUser[];

  @ManyToOne(() => Tenant, (tenant) => tenant.members, { nullable: true })
  tenant: Tenant;

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.user)
  withdrawals: Withdrawal[];

  @Column({ default: '' })
  createdBy: string;

  @Column({ default: '' })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
