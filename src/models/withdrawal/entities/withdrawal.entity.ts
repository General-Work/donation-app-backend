import { Withdrawal_Status } from 'src/lib/constants';
import { AdminUser } from 'src/models/users/admin-user/entities/admin-user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'money' })
  amount: number;

  @Column()
  transactionReference: string;

  @Column({ default: Withdrawal_Status.pending })
  status: Withdrawal_Status;

  @ManyToOne(() => AdminUser, (user) => user.withdrawals, {
    nullable: true,
    cascade: true,
  })
  user: AdminUser | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
