import { Donation } from 'src/models/donation/entities/donation.entity';
import { AdminUser } from 'src/models/users/admin-user/entities/admin-user.entity';
import { MemberUser } from 'src/models/users/member-user/entities/member-user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  gpsAddress: string;

  @Column()
  location: string;

  @Column({ default: true, type: Boolean })
  active: boolean;

  @OneToMany(() => MemberUser, (memberUser) => memberUser.tenant, {
    nullable: true,
  })
  members: MemberUser[] | null;

  @OneToMany(() => AdminUser, (memberUser) => memberUser.tenant, {
    cascade: true, // Ensures admins are updated with tenant updates
  })
  adminUsers: AdminUser[];

  @OneToMany(() => Donation, (donation) => donation.tenant)
  donations: Donation[];

  @Column({ default: '' })
  createdBy: string;

  @Column({ default: '' })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
