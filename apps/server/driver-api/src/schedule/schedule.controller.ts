// apps/driver-api/src/schedule/schedule.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  HttpCode,
  HttpStatus,
  Body,
  Query,
  ValidationPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '@nestjs/passport';
import { CheckInDto } from './dto/check-in.dto';
import { TripType, DayPart } from '../trip/trip.enums';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiProperty, // <-- Thêm cái này để định nghĩa DTO cho Swagger
} from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

// --- 1. ĐỊNH NGHĨA DTO NGAY TẠI ĐÂY (hoặc tách ra file riêng) ---
class DateRangeDto {
  @ApiProperty({ example: '2023-11-20', description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2023-11-26', description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

@ApiTags('Schedule (Driver)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('today')
  @ApiOperation({ summary: 'Lấy lịch làm việc trong ngày (sáng/chiều) của tài xế' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  getTodaySchedule(
    @Req() req,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.getDriverTodaySchedule({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  @Get('active-trip-details')
  @ApiOperation({
    summary: 'Lấy chi tiết lộ trình (các điểm dừng) của chuyến đi',
    description: 'Nếu không có query, tự tìm chuyến active. Nếu có, tìm chuyến cụ thể.',
  })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @ApiResponse({ status: 200, description: 'Trả về trạng thái chuyến và danh sách điểm dừng.' })
  getActiveTripDetails(
    @Req() req,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.getActiveRouteStops({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  @Patch('start-trip')
  @ApiOperation({ summary: 'Bắt đầu chuyến đi' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @ApiResponse({ status: 200, description: 'Chuyến đi đã bắt đầu.' })
  @HttpCode(HttpStatus.OK)
  startTrip(
    @Req() req,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.startDriverTrip({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  @Patch('complete-trip')
  @ApiOperation({ summary: 'Hoàn thành chuyến đi' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @ApiResponse({ status: 200, description: 'Chuyến đi đã hoàn thành.' })
  @HttpCode(HttpStatus.OK)
  completeTrip(
    @Req() req,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.completeDriverTrip({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  @Get('students')
  @ApiOperation({ summary: 'Lấy danh sách học sinh cho một chuyến' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  getStudentsForTrip(
    @Req() req,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.getStudentsForTrip({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  @Patch('attend')
  @ApiOperation({ summary: 'Điểm danh học sinh' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @HttpCode(HttpStatus.OK)
  attendStudent(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true })) checkInDto: CheckInDto,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.attendStudent(
      { driverId, shift: shiftQuery, session: sessionQuery },
      checkInDto,
    );
  }

  @Patch('undo-attend')
  @ApiOperation({ summary: 'Hoàn tác điểm danh' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @HttpCode(HttpStatus.OK)
  undoAttendStudent(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true })) checkInDto: CheckInDto,
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.undoAttendStudent(
      { driverId, shift: shiftQuery, session: sessionQuery },
      checkInDto,
    );
  }

  // --- 2. SỬA LẠI HÀM RANGE CHO ĐỒNG BỘ ---
  @Get('range')
  @ApiOperation({ summary: 'Lấy lịch trình theo tuần (khoảng thời gian)' })
  getWeeklySchedule(
    @Req() req, // Dùng @Req cho đồng bộ với các hàm trên
    @Query(new ValidationPipe({ transform: true })) query: DateRangeDto, // Validate input
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.getWeeklySchedule(
      driverId,
      query.startDate,
      query.endDate,
    );
  }

  // 8. GET /schedule/weekly-students
  // Lấy danh sách học sinh chi tiết theo tuần
  @Get('weekly-students')
  @ApiOperation({ summary: 'Lấy danh sách học sinh chi tiết theo tuần' })
  getWeeklyStudentList(
    @Req() req,
    @Query(new ValidationPipe({ transform: true })) query: DateRangeDto,
  ) {
    const driverId: string = req.user.userId;
    return this.scheduleService.getWeeklyStudents(
      driverId,
      query.startDate,
      query.endDate,
    );
  }
}