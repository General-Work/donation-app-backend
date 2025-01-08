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
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Data_Sort } from 'src/lib/paginate-service';
import { Request } from 'express';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib/utils';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createTenantDto: CreateTenantDto, createdBy: string) {
    return this.tenantService.create(createTenantDto, createdBy);
  }

  @Get()
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
      return this.tenantService.findAll(options);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Get('active')
  getActive(){
    return this.tenantService.getActiveTenants()
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @Req() req: Request,
  ) {
    return this.tenantService.update(id, updateTenantDto, req.userDetails.name);
  }

  @UseGuards(JwtGuard)
  @Patch('activate/:id')
  activate(@Param('id') id: string, @Req() req: Request) {
    return this.tenantService.activateUser(id, req.userDetails.name);
  }

  @UseGuards(JwtGuard)
  @Patch('deactivate/:id')
  deactivaite(@Param('id') id: string, @Req() req: Request) {
    return this.tenantService.deactivateUser(id, req.userDetails.name);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.tenantService.remove(id, req.userDetails.name);
  }
}
