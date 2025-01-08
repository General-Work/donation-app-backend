import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Data_Sort } from 'src/lib/paginate-service';
import { Request } from 'express';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib/utils';
import { JwtGuard } from 'src/models/auth/guards/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  create(@Body() createAdminUserDto: CreateAdminUserDto, @Req() req: Request) {
    return this.adminUserService.create(
      createAdminUserDto,
      req?.userDetails.name || '',
    );
  }

  @Get()
  @ApiQuery({
    name: 'tenantId',
    required: false,
    type: String,
    description: 'tenantId',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: Data_Sort,
    description: 'Order by column',
    example: Data_Sort.updatedAt_desc,
  })
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('sort') sort: Data_Sort,
    @Req() req: Request,
  ) {
    const paginate = getPaginationParams(req);
    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: {},
      order: [],
      routeName: paginate.routeName,
      path: paginate.path,
      query: paginate.query,
    };
    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
      return this.adminUserService.findAll(options,tenantId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUserService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @Req() req: Request,
  ) {
    return this.adminUserService.update(
      id,
      updateAdminUserDto,
      req.userDetails.name,
    );
  }

  @Patch('activate/:id')
  activate(@Param('id') id: string, @Req() req: Request) {
    return this.adminUserService.activateUser(id, req.userDetails.name);
  }
  @Patch('deactivate/:id')
  deactivaite(@Param('id') id: string, @Req() req: Request) {
    return this.adminUserService.deactivateUser(id, req.userDetails.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.adminUserService.remove(id, req.userDetails.name);
  }
}
