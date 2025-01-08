import { Test, TestingModule } from '@nestjs/testing';
import { MemberUserService } from './member-user.service';

describe('MemberUserService', () => {
  let service: MemberUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberUserService],
    }).compile();

    service = module.get<MemberUserService>(MemberUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
