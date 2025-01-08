import { User_Role } from 'src/lib/constants';
import { Payment } from 'src/models/payment/entities/payment.entity';
import { Tenant } from 'src/models/tenant/entities/tenant.entity';
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
export class MemberUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  password: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column()
  role: User_Role;

  @Column({ default: '' })
  otp: string;

  @Column({ default: false })
  hasVerifiedAccount: boolean;

  @Column({ nullable: true })
  otpExpiry: Date;

  @Column({ type: Boolean, default: true })
  active: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.members, {
    nullable: true, // Member can exist without being assigned to a tenant
    onDelete: 'SET NULL', // Nullifies tenant field if the tenant is deleted
  })
  tenant: Tenant;

  @OneToMany(() => Payment, (payment) => payment.user, {
    nullable: true,
  })
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
