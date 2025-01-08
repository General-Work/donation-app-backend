import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { AdminUser } from 'src/models/users/admin-user/entities/admin-user.entity';
import { MemberUser } from 'src/models/users/member-user/entities/member-user.entity';
import { Tenant } from 'src/models/tenant/entities/tenant.entity';
import { Donation } from 'src/models/donation/entities/donation.entity';
import { Payment } from 'src/models/payment/entities/payment.entity';
import { Withdrawal } from 'src/models/withdrawal/entities/withdrawal.entity';
config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: `${process.env.DB_HOST}`,
  port: Number(`${process.env.DB_PORT}`),
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_DATABASE}`,
  entities: [Tenant, AdminUser, MemberUser, Donation, Payment, Withdrawal],

  migrations: [],
  // migrations: ['dist/db/migrations/*{.ts,.js}'],

  logging: ['error'],
  synchronize: true,
  options: {
    // multipleActiveResultSets:true
    // instanceName: 'SQLEXPRESS',
    // encrypt: true,
    trustServerCertificate: true,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
