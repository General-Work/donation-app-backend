import { Donation_Type } from 'src/lib/constants';
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
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  purpose: string;

  @Column()
  type: Donation_Type;

  @Column({default:true})
  active:boolean


  @Column({ nullable: true })
  startDate: Date | null;

  @Column({ nullable: true })
  endDate: Date | null;

  @OneToMany(() => Payment, (payment) => payment.donation)
  payments: Payment[];

  @ManyToOne(() => Tenant, (tenant) => tenant.donations, {
    nullable: false, // A donation must be associated with a tenant
    onDelete: 'CASCADE', // If a tenant is deleted, its donations are also removed
  })
  tenant: Tenant;

  @Column({ default: '' })
  createdBy: string;

  @Column({ default: '' })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
