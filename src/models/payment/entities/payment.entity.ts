import {
  Donation_Type,
  PAYMENT_OPTIONS,
  Payment_Status,
} from 'src/lib/constants';
import { Donation } from 'src/models/donation/entities/donation.entity';
import { MemberUser } from 'src/models/users/member-user/entities/member-user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'money' })
  amount: number;

  @Column()
  transactionReference: string;

  @Column({ type: Boolean })
  isAnonymous: boolean;

  @Column({ default: Payment_Status.notPaid })
  status: Payment_Status;

  @Column({ default: '' })
  momoNumber: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column()
  paymentOption: PAYMENT_OPTIONS;

  @ManyToOne(() => Donation, (gym) => gym.payments, {
    eager: false,
  })
  donation: Donation;

  @ManyToOne(() => MemberUser, (user) => user.payments, {
    nullable: true,
    cascade: true,
    eager: false,
  })
  user: MemberUser | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
