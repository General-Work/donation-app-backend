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
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Data_Sort } from 'src/lib/paginate-service';
import { Request } from 'express';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib/utils';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('tenant-counts/:tenantId')
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year',
  })
  findAll(@Param('tenantId') id: string, @Query('year') year: number) {
    return this.dashboardService.tenantCounts(id, year);
  }

  @Get('tenant-members/:tenantId')
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
  members(
    @Param('tenantId') id: string,
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
      return this.dashboardService.getMembers(options, id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
