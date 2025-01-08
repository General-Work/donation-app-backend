import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Data_Sort } from 'src/lib/paginate-service';
import { Request } from 'express';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib/utils';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donation')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createDonationDto: CreateDonationDto, @Req() req: Request) {
    return this.donationService.create(
      createDonationDto,
      req.userDetails.name,
      req.userDetails.tenantId,
    );
  }

  @UseGuards(JwtGuard)
  @Get(':tenantId')
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
      return this.donationService.findAll(options, id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('byId/:id')
  findOne(@Param('id') id: string) {
    return this.donationService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
    @Req() req: Request,
  ) {
    return this.donationService.update(
      id,
      updateDonationDto,
      req.userDetails.name,
    );
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.donationService.remove(id, req.userDetails.name);
  }
}
