import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TripService } from './trip.service'; 
import { AuthGuard } from '@nestjs/passport'; 
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripHistoryBE, HistorySummary } from './trip.service'; // << IMPORT INTERFACE ĐÃ ĐƯỢC EXPORT

@ApiTags('Trips (Driver)')
@ApiBearerAuth()
@Controller('trips')
@UseGuards(AuthGuard('jwt')) 
export class TripController {
  constructor(private readonly tripService: TripService) {}

  // Lấy danh sách chi tiết các chuyến đi
  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử chi tiết các chuyến đi đã hoàn thành/hủy (30 ngày)' })
  getHistory(@Req() req: any): Promise<TripHistoryBE[]> { 
    return this.tripService.getHistoryListByUser(req.user); 
  }

  // Lấy tổng quan (Summary Stats)
  @Get('history/summary')
  @ApiOperation({ summary: 'Lấy tổng quan thống kê chuyến đi trong 30 ngày' })
  getSummary(@Req() req: any): Promise<HistorySummary> { 
    return this.tripService.getHistorySummaryByUser(req.user);
  }
}