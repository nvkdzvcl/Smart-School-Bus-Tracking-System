import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TripService } from './trip.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripHistoryBE, HistorySummary } from './trip.service'; // << IMPORT INTERFACE ĐÃ ĐƯỢC EXPORT

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @ApiTags('Trips (Driver)')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  // Lấy danh sách chi tiết các chuyến đi
  @Get('history')
  @ApiOperation({
    summary: 'Lấy lịch sử chi tiết các chuyến đi đã hoàn thành/hủy (30 ngày)',
  })
  getHistory(@Req() req: any): Promise<TripHistoryBE[]> {
    return this.tripService.getHistoryListByUser(req.user);
  }

  @ApiTags('Trips (Driver)')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  // Lấy tổng quan (Summary Stats)
  @Get('history/summary')
  @ApiOperation({ summary: 'Lấy tổng quan thống kê chuyến đi trong 30 ngày' })
  getSummary(@Req() req: any): Promise<HistorySummary> {
    return this.tripService.getHistorySummaryByUser(req.user);
  }

  /**
   * GET /trips/student/:studentId/schedule?from=2025-11-01&to=2025-11-07
   */
  @Get('student/:studentId/schedule')
  async getSchedule(
    @Param('studentId') studentId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.tripService.getStudentSchedule(studentId, from, to);
  }
}
