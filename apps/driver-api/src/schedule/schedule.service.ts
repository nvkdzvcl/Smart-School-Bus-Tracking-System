// apps/driver-api/src/schedule/schedule.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format } from 'date-fns';

import { Trip } from '../trip/trip.entity';
import {
  TripType,
  TripStatus,
  attendance_status,
  DayPart,
} from '../trip/trip.enums';
import { RouteStop } from '../route/route-stop.entity';
import { Student } from '../student/student.entity';
import { TripStudent } from '../trip/trip-student.entity';
import { CheckInDto } from './dto/check-in.dto';

type ScheduleFilter = {
  driverId: string;
  shift?: TripType; // pickup | dropoff (optional)
  session?: DayPart; // morning | afternoon (optional)
};

const VN_TZ = 'Asia/Ho_Chi_Minh';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(RouteStop)
    private routeStopRepository: Repository<RouteStop>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(TripStudent)
    private tripStudentRepository: Repository<TripStudent>,
  ) {}

  // ----- Helpers (Giữ nguyên toàn bộ) -----
  private mapSessionToShift(session: DayPart): TripType {
    return session === DayPart.MORNING ? TripType.PICKUP : TripType.DROPOFF;
  }
  private mapShiftToSession(shift: TripType): DayPart {
    return shift === TripType.PICKUP ? DayPart.MORNING : DayPart.AFTERNOON;
  }

  private resolveShiftSession(filter: ScheduleFilter): {
    type: TripType;
    session: DayPart;
  } {
    let { shift, session } = filter;

    if (!shift && !session) {
      const hourVN = Number(
        new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          hour12: false,
          timeZone: VN_TZ,
        }).format(new Date()),
      );
      session = hourVN < 12 ? DayPart.MORNING : DayPart.AFTERNOON;
      shift = this.mapSessionToShift(session);
    }
    if (!shift && session) shift = this.mapSessionToShift(session);
    if (shift && !session) session = this.mapShiftToSession(shift);

    if (
      (shift === TripType.PICKUP && session !== DayPart.MORNING) ||
      (shift === TripType.DROPOFF && session !== DayPart.AFTERNOON)
    ) {
      throw new BadRequestException(
        'Giá trị shift và session không khớp (pickup↔morning, dropoff↔afternoon).',
      );
    }
    return { type: shift!, session: session! };
  }

  // Helper 1: Tìm trip theo filter (dùng cho StudentsPage)
  private async findCurrentDriverTrip(filter: ScheduleFilter): Promise<Trip> {
    const { driverId } = filter;
    const { type, session } = this.resolveShiftSession(filter);

    const trip = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.bus', 'bus')
      .where('trip.driverId = :driverId', { driverId })
      .andWhere('trip.tripDate = CURRENT_DATE')
      .andWhere('trip.type = :type', { type })
      .andWhere('trip.session = :session', { session })
      .getOne();

    if (!trip) {
      const viType = type === TripType.PICKUP ? 'đón' : 'trả';
      const viSes = session === DayPart.MORNING ? 'ca sáng' : 'ca chiều';
      throw new NotFoundException(
        `Không tìm thấy chuyến ${viType} (${viSes}) được gán cho bạn trong ngày hôm nay.`,
      );
    }
    return trip;
  }

  // Helper 2: Tự động tìm trip (dùng cho RoutePage)
  private async findActiveTrip(driverId: string): Promise<Trip> {
    const today = new Date().toISOString().split('T')[0];

    const qb = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.bus', 'bus')
      .where('trip.driverId = :driverId', { driverId })
      .andWhere('trip.tripDate = :today', { today })
      .orderBy('trip.session', 'ASC')
      .addOrderBy('trip.type', 'ASC');

    const inProgressTrip = await qb
      .clone()
      .andWhere('trip.status = :status', { status: TripStatus.IN_PROGRESS })
      .getOne();

    if (inProgressTrip) {
      return inProgressTrip;
    }

    const scheduledTrip = await qb
      .clone()
      .andWhere('trip.status = :status', { status: TripStatus.SCHEDULED })
      .getOne();

    if (scheduledTrip) {
      return scheduledTrip;
    }

    throw new NotFoundException(
      'Không tìm thấy chuyến đi nào (đang chạy hoặc theo lịch) cho bạn hôm nay.',
    );
  }
  // ----- Hết Helpers -----

  // ========== API 1: Lịch hôm nay (Giữ nguyên) ==========
  async getDriverTodaySchedule(filter: ScheduleFilter) {
    const trip = await this.findCurrentDriverTrip(filter);
    // ... (logic của bạn giữ nguyên)
    const total = await this.tripStudentRepository.count({
      where: { tripId: trip.id },
    });
    const attended = await this.tripStudentRepository.count({
      where: { tripId: trip.id, status: attendance_status.ATTENDED },
    });
    const isPickup = trip.type === TripType.PICKUP;
    return {
      shift: isPickup ? 'Ca sáng' : 'Ca chiều',
      route: trip.route ? trip.route.name : 'Chưa có tuyến',
      startTime: trip.actualStartTime
        ? format(new Date(trip.actualStartTime), 'HH:mm')
        : 'Chưa rõ',
      vehicle: trip.bus ? `${trip.bus.licensePlate}` : 'Chưa gán xe',
      totalStudents: total,
      pickedUp: isPickup ? attended : 0,
      droppedOff: !isPickup ? attended : 0,
      remaining: total - attended,
    };
  }

  // ========== API 2: Điểm dừng đang chạy (ĐÃ CẬP NHẬT) ==========
  async getActiveRouteStops(filter: ScheduleFilter) {
    const { driverId, shift, session } = filter;
    let trip: Trip;

    if (shift || session) {
      // 1. Nếu có filter (từ StudentsPage) -> Tìm chuyến CỤ THỂ
      trip = await this.findCurrentDriverTrip(filter);
    } else {
      // 2. Nếu không có filter (từ RoutePage) -> Tìm chuyến HOẠT ĐỘNG
      trip = await this.findActiveTrip(driverId);
    }

    const actualStartTime = trip.actualStartTime
      ? format(new Date(trip.actualStartTime), 'HH:mm')
      : null;
    const actualEndTime = trip.actualEndTime
      ? format(new Date(trip.actualEndTime), 'HH:mm')
      : null;

    // --- Logic bên dưới giữ nguyên y hệt phiên bản trước ---
    const tripId = trip.id;
    const routeId = trip.routeId;

    const studentsOnThisTrip = await this.tripStudentRepository.find({
      where: { tripId },
      relations: ['student', 'student.pickupStop', 'student.dropoffStop'],
    });

    if (!routeId) {
      return { tripStatus: trip.status, stops: [] };
    }

    const stopsOnThisRoute = await this.routeStopRepository.find({
      where: { routeId },
      relations: ['stop'],
      order: { stopOrder: 'ASC' },
    });

    const isPickup = trip.type === TripType.PICKUP;
    let currentStopFound = false;

    const formattedStops = stopsOnThisRoute.map((routeStop) => {
      const stop = routeStop.stop;
      let stopStatus: 'pending' | 'current' | 'completed' = 'pending';

      const studentsAtThisStop = studentsOnThisTrip.filter((ts) =>
        isPickup
          ? ts.student.pickupStop?.id === stop.id
          : ts.student.dropoffStop?.id === stop.id,
      );

      if (trip.status === TripStatus.SCHEDULED) {
        stopStatus = 'pending';
      } else if (trip.status === TripStatus.IN_PROGRESS && !currentStopFound) {
        const allProcessed = studentsAtThisStop.every(
          (s) => s.status !== attendance_status.PENDING,
        );

        if (allProcessed) {
          stopStatus = 'completed';
        } else {
          stopStatus = 'current';
          currentStopFound = true;
        }
      } else if (trip.status === TripStatus.COMPLETED) {
        stopStatus = 'completed';
      } else if (currentStopFound) {
        stopStatus = 'pending';
      }

      return {
        id: stop.id,
        name: stop.name,
        address: stop.address || 'Không có địa chỉ',
        students: studentsAtThisStop.length,
        status: stopStatus,
        eta: '--:--',
        lat: stop.latitude,
        lng: stop.longitude,
      };
    });

    return {
      tripStatus: trip.status,
      actualStartTime,
      actualEndTime,
      stops: formattedStops,
    };
  }

  // ========== API 3: Bắt đầu chuyến (ĐÃ CẬP NHẬT) ==========
  async startDriverTrip(filter: ScheduleFilter) {
    const { driverId, shift, session } = filter;
    let trip: Trip;

    if (shift || session) {
      // 1. Nếu có filter (từ StudentsPage) -> Tìm chuyến CỤ THỂ
      trip = await this.findCurrentDriverTrip(filter);
    } else {
      // 2. Nếu không có filter (từ RoutePage) -> Tìm chuyến HOẠT ĐỘNG
      trip = await this.findActiveTrip(driverId);
    }

    // --- Logic check status giữ nguyên y hệt phiên bản trước ---
    if (trip.status === TripStatus.IN_PROGRESS) {
      throw new ConflictException('Chuyến đi này đã bắt đầu.');
    }
    if (trip.status !== TripStatus.SCHEDULED) {
      throw new ConflictException('Chuyến đi này đã hoàn thành hoặc bị hủy.');
    }

    await this.tripRepository.update(trip.id, {
      status: TripStatus.IN_PROGRESS,
      actualStartTime: new Date(),
    });

    return {
      message: 'Chuyến đi đã bắt đầu!',
      newStatus: TripStatus.IN_PROGRESS,
    };
  }

  // ========== API 3.5: (HÀM MỚI) Hoàn thành chuyến ==========
  async completeDriverTrip(filter: ScheduleFilter) {
    const { driverId, shift, session } = filter;
    let trip: Trip;

    if (shift || session) {
      trip = await this.findCurrentDriverTrip(filter);
    } else {
      trip = await this.findActiveTrip(driverId);
    }

    // 1. Chỉ cho phép hoàn thành chuyến 'in_progress'
    if (trip.status !== TripStatus.IN_PROGRESS) {
      if (trip.status === TripStatus.COMPLETED)
        throw new ConflictException('Chuyến đi đã được hoàn thành từ trước.');
      if (trip.status === TripStatus.SCHEDULED)
        throw new ConflictException('Chuyến đi chưa bắt đầu.');
      throw new ConflictException('Không thể hoàn thành chuyến đi này.');
    }

    // 2. (Good Practice) Kiểm tra xem còn học sinh 'pending' không
    const remaining = await this.tripStudentRepository.count({
      where: { tripId: trip.id, status: attendance_status.PENDING },
    });

    if (remaining > 0) {
      throw new ConflictException(
        `Vẫn còn ${remaining} học sinh chưa được điểm danh. Không thể hoàn thành chuyến.`,
      );
    }

    // 3. Cập nhật
    await this.tripRepository.update(trip.id, {
      status: TripStatus.COMPLETED,
      actualEndTime: new Date(), // Thêm thời gian kết thúc
    });

    return {
      message: 'Chuyến đi đã hoàn thành!',
      newStatus: TripStatus.COMPLETED,
    };
  }

  // ========== API 4: Danh sách học sinh (Giữ nguyên) ==========
  async getStudentsForTrip(filter: ScheduleFilter) {
    const trip = await this.findCurrentDriverTrip(filter);
    // ... (logic của bạn giữ nguyên)
    const studentsOnTrip = await this.tripStudentRepository.find({
      where: { tripId: trip.id },
      relations: ['student', 'student.pickupStop', 'student.dropoffStop'],
      order: { student: { fullName: 'ASC' } },
    });
    const total = studentsOnTrip.length;
    const attended = studentsOnTrip.filter(
      (s) => s.status === attendance_status.ATTENDED,
    ).length;
    const absent = studentsOnTrip.filter(
      (s) => s.status === attendance_status.ABSENT,
    ).length;
    const isPickup = trip.type === TripType.PICKUP;
    const stats = {
      total,
      pickedUp: isPickup ? attended : 0,
      droppedOff: !isPickup ? attended : 0,
      remaining: total - attended - absent,
    };
    const formattedStudents = studentsOnTrip.map((ts) => {
      const st = ts.student;
      const address = isPickup
        ? st.pickupStop?.name || 'Chưa gán điểm đón'
        : st.dropoffStop?.name || 'Chưa gán điểm trả';
      return {
        id: st.id,
        fullName: st.fullName,
        address,
        status: ts.status,
        attendedAt: ts.attendedAt,
      };
    });
    return { stats, students: formattedStudents };
  }

  // ========== API 5: Điểm danh (Giữ nguyên) ==========
  async attendStudent(filter: ScheduleFilter, checkInDto: CheckInDto) {
    const trip = await this.findCurrentDriverTrip(filter);
    // ... (logic của bạn giữ nguyên)
    const studentId = checkInDto.studentId;
    const attendanceRecord = await this.tripStudentRepository.findOne({
      where: { tripId: trip.id, studentId },
    });
    if (!attendanceRecord)
      throw new NotFoundException('Không tìm thấy học sinh này trong chuyến đi.');
    if (attendanceRecord.status === attendance_status.ATTENDED) {
      throw new ConflictException('Học sinh này đã được điểm danh.');
    }
    await this.tripStudentRepository.update(
      { tripId: trip.id, studentId },
      { status: attendance_status.ATTENDED, attendedAt: new Date() },
    );
    return { ...attendanceRecord, status: attendance_status.ATTENDED };
  }

  // ========== API 6: Hoàn tác (Giữ nguyên) ==========
  async undoAttendStudent(filter: ScheduleFilter, checkInDto: CheckInDto) {
    const trip = await this.findCurrentDriverTrip(filter);
    // ... (logic của bạn giữ nguyên)
    const studentId = checkInDto.studentId;
    const attendanceRecord = await this.tripStudentRepository.findOne({
      where: { tripId: trip.id, studentId },
    });
    if (!attendanceRecord)
      throw new NotFoundException(
        'Không tìm thấy học sinh này trong chuyến đi.',
      );
    if (attendanceRecord.status === attendance_status.PENDING) {
      throw new ConflictException('Học sinh này chưa được điểm danh.');
    }
    await this.tripStudentRepository.update(
      { tripId: trip.id, studentId },
      { status: attendance_status.PENDING, attendedAt: null },
    );
    return { ...attendanceRecord, status: attendance_status.PENDING };
  }
}