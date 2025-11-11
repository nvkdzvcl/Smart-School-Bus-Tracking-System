// // apps/driver-api/src/schedule/schedule.controller.ts
// import {
//   Controller,
//   Get,
//   UseGuards,
//   Req,
//   Patch,
//   HttpCode,
//   HttpStatus,
//   Body,
//   Query,
//   ValidationPipe,
//   ParseEnumPipe,
// } from '@nestjs/common';
// import { ScheduleService } from './schedule.service';
// import { AuthGuard } from '@nestjs/passport';
// import { CheckInDto } from './dto/check-in.dto';
// import { TripType, DayPart } from '../trip/trip.enums';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiBearerAuth,
//   ApiResponse,
// } from '@nestjs/swagger';

// @ApiTags('Schedule (Driver)') // Gom nhóm API
// @ApiBearerAuth() // Yêu cầu token
// @UseGuards(AuthGuard('jwt')) // Bảo vệ tất cả
// @Controller('schedule')
// export class ScheduleController {
//   constructor(private readonly scheduleService: ScheduleService) {}

//   @Get('today')
//   @ApiOperation({ summary: 'Lấy lịch làm việc trong ngày (sáng/chiều) của tài xế' })
//   getTodaySchedule(
//     @Req() req,
//     @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
//     shiftQuery?: TripType,
//     @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
//     sessionQuery?: DayPart,
//   ) {
//     const driverId: string = req.user.userId; // Giữ nguyên theo code của bạn
//     return this.scheduleService.getDriverTodaySchedule({
//       driverId,
//       shift: shiftQuery,
//       session: sessionQuery,
//     });
//   }

//   // --- Tinh Chỉnh Endpoint Này ---
//   @Get('active-trip-details')
//   @ApiOperation({
//     summary: 'Lấy chi tiết lộ trình (các điểm dừng) của chuyến đi HIỆN TẠI',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Trả về trạng thái chuyến và danh sách điểm dừng.',
//   })
//   @ApiResponse({ status: 404, description: 'Không tìm thấy chuyến đi nào.' })
//   getActiveTripDetails(@Req() req) {
//     // Xóa Query params, vì FE (Route.tsx) không gửi
//     // Service sẽ tự động tìm chuyến 'in_progress' hoặc 'scheduled'
//     const driverId: string = req.user.userId;
//     return this.scheduleService.getActiveRouteStops(driverId);
//   }

//   // --- Tinh Chỉnh Endpoint Này ---
//   @Patch('start-trip')
//   @ApiOperation({ summary: 'Bắt đầu chuyến đi HIỆN TẠI' })
//   @ApiResponse({ status: 200, description: 'Chuyến đi đã bắt đầu.' })
//   @ApiResponse({
//     status: 409,
//     description: 'Chuyến đi đã được bắt đầu từ trước.',
//   })
//   @HttpCode(HttpStatus.OK)
//   startTrip(@Req() req) {
//     // Xóa Query params, FE chỉ bấm "Bắt đầu"
//     // Service sẽ tự tìm chuyến 'scheduled' tiếp theo
//     const driverId: string = req.user.userId;
//     return this.scheduleService.startDriverTrip(driverId);
//   }

//   @Get('students')
//   @ApiOperation({
//     summary: 'Lấy danh sách học sinh cho một chuyến (có thể xem trước)',
//   })
//   getStudentsForTrip(
//     @Req() req,
//     @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
//     shiftQuery?: TripType,
//     @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
//     sessionQuery?: DayPart,
//   ) {
//     const driverId: string = req.user.userId;
//     return this.scheduleService.getStudentsForTrip({
//       driverId,
//       shift: shiftQuery,
//       session: sessionQuery,
//     });
//   }

//   @Patch('attend')
//   @ApiOperation({ summary: 'Điểm danh học sinh' })
//   @HttpCode(HttpStatus.OK)
//   attendStudent(
//     @Req() req,
//     @Body(new ValidationPipe({ whitelist: true })) checkInDto: CheckInDto,
//     @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
//     shiftQuery?: TripType,
//     @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
//     sessionQuery?: DayPart,
//   ) {
//     const driverId: string = req.user.userId;
//     return this.scheduleService.attendStudent(
//       { driverId, shift: shiftQuery, session: sessionQuery },
//       checkInDto,
//     );
//   }

//   @Patch('undo-attend')
//   @ApiOperation({ summary: 'Hoàn tác điểm danh (bấm nhầm)' })
//   @HttpCode(HttpStatus.OK)
//   undoAttendStudent(
//     @Req() req,
//     @Body(new ValidationPipe({ whitelist: true })) checkInDto: CheckInDto,
//     @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
//     shiftQuery?: TripType,
//     @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
//     sessionQuery?: DayPart,
//   ) {
//     const driverId: string = req.user.userId;
//     return this.scheduleService.undoAttendStudent(
//       { driverId, shift: shiftQuery, session: sessionQuery },
//       checkInDto,
//     );
//   }
// }
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
  ApiQuery, // <-- Thêm ApiQuery để làm rõ
} from '@nestjs/swagger';

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

  // --- SỬA LẠI HÀM NÀY ---
  @Get('active-trip-details')
  @ApiOperation({
    summary: 'Lấy chi tiết lộ trình (các điểm dừng) của chuyến đi',
    description:
      'Nếu không có query, tự tìm chuyến active. Nếu có, tìm chuyến cụ thể.',
  })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @ApiResponse({ status: 200, description: 'Trả về trạng thái chuyến và danh sách điểm dừng.' })
  getActiveTripDetails(
    @Req() req,
    // Thêm lại Query
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    // Truyền cả object filter xuống service
    return this.scheduleService.getActiveRouteStops({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  // --- SỬA LẠI HÀM NÀY ---
  @Patch('start-trip')
  @ApiOperation({ summary: 'Bắt đầu chuyến đi' })
  @ApiQuery({ name: 'shift', enum: TripType, required: false })
  @ApiQuery({ name: 'session', enum: DayPart, required: false })
  @ApiResponse({ status: 200, description: 'Chuyến đi đã bắt đầu.' })
  @HttpCode(HttpStatus.OK)
  startTrip(
    @Req() req,
    // Thêm lại Query
    @Query('shift', new ParseEnumPipe(TripType, { optional: true }))
    shiftQuery?: TripType,
    @Query('session', new ParseEnumPipe(DayPart, { optional: true }))
    sessionQuery?: DayPart,
  ) {
    const driverId: string = req.user.userId;
    // Truyền cả object filter xuống service
    return this.scheduleService.startDriverTrip({
      driverId,
      shift: shiftQuery,
      session: sessionQuery,
    });
  }

  // --- API MỚI ---
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
  // --- HẾT API MỚI ---

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
}