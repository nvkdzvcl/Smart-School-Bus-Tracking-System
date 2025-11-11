// apps/driver-api/src/reports/reports.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports (Driver)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

@Get()
  @ApiOperation({ summary: 'Lấy lịch sử báo cáo của tài xế' })
  findAll(@Req() req) {
    const driverId = req.user.userId;
    return this.reportsService.findAllByDriver(driverId);
  }

  @Post()
  @ApiOperation({ summary: 'Gửi một báo cáo sự cố mới' })
  create(
    @Req() req,
    @Body(new ValidationPipe()) createReportDto: CreateReportDto,
  ) {
    const driverId = req.user.userId;
    return this.reportsService.create(driverId, createReportDto);
  }
}