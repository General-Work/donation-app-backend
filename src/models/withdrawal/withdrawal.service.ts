import { Injectable } from '@nestjs/common';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { AdminUserService } from '../users/admin-user/admin-user.service';
import axios, { HttpStatusCode } from 'axios';
import { getProviderCode } from 'src/lib/utils';

@Injectable()
export class WithdrawalService {
  private readonly api = 'https://payment-service-dxnw.onrender.com/api/v1';

  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly userService: AdminUserService,
  ) {}
  async create(createWithdrawalDto: CreateWithdrawalDto, userId: string) {
    try {
      const initiate = await axios.post(
        `${this.api}/payment/withdraw`,
        {
          type: 'mobile_money',
          name: createWithdrawalDto.momoName,
          currency: 'GHS',
          account_number: createWithdrawalDto.phoneNumber,
          bank_code: getProviderCode(createWithdrawalDto.phoneNumber),
          reason: createWithdrawalDto.reason,
          amount: createWithdrawalDto.amount * 100,
        },
        {
          headers: {
            'api-key': process.env.PAYMENT_API_KEY,
          },
        },
      );
      console.log(initiate.data);
      return true;
      const user = await this.userService.findOne(userId);
      if (!user.data) {
        return {
          success: false,
          message: 'User not found',
          status: HttpStatusCode.NotFound,
        };
      }
      // const withdrawal = new Withdrawal();
      // withdrawal.amount = createWithdrawalDto.amount;
      // withdrawal.transactionReference = createWithdrawalDto.transactionReference;
    } catch (error) {
      // console.log(error);
      // console.log(error?.response?.data?.data?.message);
      // console.log(error?.response?.data);


      return {
        success: false,
        message: error?.response?.data?.data?.message || error?.message ||error,
        status: HttpStatusCode.BadRequest,
      };
    }
  }

  findAll() {
    return `This action returns all withdrawal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} withdrawal`;
  }

  update(id: number, updateWithdrawalDto: UpdateWithdrawalDto) {
    return `This action updates a #${id} withdrawal`;
  }

  remove(id: number) {
    return `This action removes a #${id} withdrawal`;
  }
}
