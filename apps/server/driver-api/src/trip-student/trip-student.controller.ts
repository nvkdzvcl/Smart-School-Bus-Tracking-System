import { Controller, Get, Param, Query } from '@nestjs/common';
import { TripStudentService } from './trip-student.service';

@Controller('trip-student')
export class TripStudentController {
  constructor(private readonly tripStudentService: TripStudentService) {}

  @Get('recent/:studentId')
  async getRecent(
    @Param('studentId') studentId: string,
    @Query('limit') limit?: number,
  ) {
    return this.tripStudentService.getRecentAttendance(studentId, limit || 5);
  }
}
