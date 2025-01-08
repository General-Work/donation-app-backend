import { PartialType } from '@nestjs/swagger';
import { CreateMemberUserDto } from './create-member-user.dto';

export class UpdateMemberUserDto extends PartialType(CreateMemberUserDto) {}
