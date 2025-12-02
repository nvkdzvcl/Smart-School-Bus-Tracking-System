// apps/driver-api/src/trip/trip.controller.ts

import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TripService } from './trip.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripHistoryBE, HistorySummary } from './trip.service';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  // 👇👇👇 THÊM ĐOẠN NÀY VÀO ĐÂY (Route lấy học sinh) 👇👇👇
  @ApiTags('Trips (Driver)')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('current/students')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh của chuyến đi đang chạy (Active)',
  })
  async getCurrentTripStudents(@Req() req: any) {
    // Gọi hàm bên Service (đảm bảo bạn đã thêm hàm này bên trip.service.ts rồi nhé)
    return this.tripService.getStudentsInCurrentTrip(req.user.id);
  }
  // 👆👆👆 HẾT PHẦN THÊM MỚI 👆👆👆

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

  /**
   * GET /trips/:tripId/locations?limit=1
   * Trả về danh sách vị trí (mới nhất trước)
   * Dùng cho Parent-App tracking
   */
  @Get(':tripId/locations')
  async getTripLocations(
    @Param('tripId') tripId: string,
    @Query('limit') limit?: string,
  ) {
    return this.tripService.getTripLocations(tripId, Number(limit) || 1);
  }
}
