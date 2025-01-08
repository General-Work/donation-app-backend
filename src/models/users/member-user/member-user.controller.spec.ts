import { Test, TestingModule } from '@nestjs/testing';
import { MemberUserController } from './member-user.controller';
import { MemberUserService } from './member-user.service';

describe('MemberUserController', () => {
  let controller: MemberUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberUserController],
      providers: [MemberUserService],
    }).compile();

    controller = module.get<MemberUserController>(MemberUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
