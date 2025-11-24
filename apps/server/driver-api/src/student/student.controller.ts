import { Body, Controller, Get, Param } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':parentId/today')
  async getMyChildrenToday(@Param('parentId') parentId: string) {
    return this.studentService.getMyChildrenWithTodayTrips(parentId);
  }
}
