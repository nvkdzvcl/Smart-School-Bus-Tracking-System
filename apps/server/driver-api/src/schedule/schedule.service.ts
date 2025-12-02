// apps/driver-api/src/schedule/schedule.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

  // ========== API 1: Lịch hôm nay (Cập nhật logic remaining) ==========
  async getDriverTodaySchedule(filter: ScheduleFilter) {
    const trip = await this.findCurrentDriverTrip(filter);

    // 1. Tổng số học sinh active trong chuyến
    const total = await this.tripStudentRepository.count({
      where: {
        tripId: trip.id,
        student: { status: 'active' } as any,
      },
      relations: ['student'],
    });

    // 2. Số học sinh đã điểm danh (ATTENDED)
    const attended = await this.tripStudentRepository.count({
      where: {
        tripId: trip.id,
        status: attendance_status.ATTENDED,
        student: { status: 'active' } as any,
      },
      relations: ['student'],
    });

    // 3. Số học sinh vắng (ABSENT) - CẦN THÊM ĐỂ TÍNH REMAINING CHÍNH XÁC
    const absent = await this.tripStudentRepository.count({
      where: {
        tripId: trip.id,
        status: attendance_status.ABSENT,
        student: { status: 'active' } as any,
      },
      relations: ['student'],
    });

    const isPickup = trip.type === TripType.PICKUP;
    
    // Logic Remaining mới: Tổng - (Đã đón + Vắng)
    // Nghĩa là: Chỉ đếm những em còn đang PENDING
    const remaining = total - attended - absent;

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
      remaining: remaining, // Số liệu chính xác để hiển thị badge 'Còn lại'
    };
  }

  // ========== API 2: Điểm dừng đang chạy (Cập nhật logic completed stop) ==========
  async getActiveRouteStops(filter: ScheduleFilter) {
    const { driverId, shift, session } = filter;
    let trip: Trip;

    if (shift || session) {
      trip = await this.findCurrentDriverTrip(filter);
    } else {
      trip = await this.findActiveTrip(driverId);
    }

    const actualStartTime = trip.actualStartTime
      ? format(new Date(trip.actualStartTime), 'HH:mm')
      : null;
    const actualEndTime = trip.actualEndTime
      ? format(new Date(trip.actualEndTime), 'HH:mm')
      : null;

    const tripId = trip.id;
    const routeId = trip.routeId;

    const studentsOnThisTrip = await this.tripStudentRepository.find({
      where: {
        tripId,
        student: { status: 'active' } as any,
      },
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
        // Logic kiểm tra stop hoàn thành:
        // Stop xong khi TẤT CẢ học sinh tại đó KHÔNG CÒN là PENDING
        // (tức là đã ATTENDED hoặc ABSENT hết rồi)
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

  // ========== API 3: Bắt đầu chuyến (Giữ nguyên) ==========
  async startDriverTrip(filter: ScheduleFilter) {
    const { driverId, shift, session } = filter;
    let trip: Trip;

    if (shift || session) {
      trip = await this.findCurrentDriverTrip(filter);
    } else {
      trip = await this.findActiveTrip(driverId);
    }

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

  // ========== API 3.5: Hoàn thành chuyến (Cập nhật logic đếm remaining) ==========
  async completeDriverTrip(filter: ScheduleFilter) {
    const { driverId, shift, session } = filter;
    let trip: Trip;

    if (shift || session) {
      trip = await this.findCurrentDriverTrip(filter);
    } else {
      trip = await this.findActiveTrip(driverId);
    }

    // 1. Kiểm tra trạng thái chuyến đi
    if (trip.status !== TripStatus.IN_PROGRESS) {
      if (trip.status === TripStatus.COMPLETED)
        throw new ConflictException('Chuyến đi đã được hoàn thành từ trước.');
      if (trip.status === TripStatus.SCHEDULED)
        throw new ConflictException(
          'Chuyến đi chưa bắt đầu (Vui lòng bấm Bắt đầu trước).',
        );
      throw new ConflictException('Không thể hoàn thành chuyến đi này.');
    }

    // 2. Kiểm tra học sinh chưa điểm danh (CHỈ ĐẾM PENDING)
    // Học sinh ABSENT (vắng) sẽ KHÔNG bị tính vào đây -> Cho phép hoàn thành chuyến
    const remainingPending = await this.tripStudentRepository
      .createQueryBuilder('ts')
      .leftJoin('ts.student', 'student')
      .where('ts.tripId = :tripId', { tripId: trip.id })
      .andWhere('ts.status = :pendingStatus', {
        pendingStatus: attendance_status.PENDING,
      })
      .andWhere('student.status = :activeStatus', { activeStatus: 'active' })
      .getCount();

    if (remainingPending > 0) {
      throw new ConflictException(
        `Vẫn còn ${remainingPending} học sinh chưa được xử lý (chưa điểm danh hoặc báo vắng).`,
      );
    }

    // 3. Cập nhật thành công
    await this.tripRepository.update(trip.id, {
      status: TripStatus.COMPLETED,
      actualEndTime: new Date(),
    });

    return {
      message: 'Chuyến đi đã hoàn thành!',
      newStatus: TripStatus.COMPLETED,
    };
  }

  // ========== API 4: Danh sách học sinh (Cập nhật logic remaining) ==========
  async getStudentsForTrip(filter: ScheduleFilter) {
    const trip = await this.findCurrentDriverTrip(filter);

    const studentsOnTrip = await this.tripStudentRepository.find({
      where: {
        tripId: trip.id,
        student: { status: 'active' } as any,
      },
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

    // Logic Remaining mới: Tổng - (Đã đón + Vắng)
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

  // ========== API 5: Điểm danh (Cập nhật chặn nếu đã vắng) ==========
  async attendStudent(filter: ScheduleFilter, checkInDto: CheckInDto) {
    const trip = await this.findCurrentDriverTrip(filter);

    const studentId = checkInDto.studentId;
    const attendanceRecord = await this.tripStudentRepository.findOne({
      where: { tripId: trip.id, studentId },
    });

    if (!attendanceRecord)
      throw new NotFoundException('Không tìm thấy học sinh này trong chuyến đi.');

    if (attendanceRecord.status === attendance_status.ATTENDED) {
      throw new ConflictException('Học sinh này đã được điểm danh.');
    }

    // Thêm: Chặn điểm danh nếu đã báo vắng (tránh ghi đè logic báo cáo)
    if (attendanceRecord.status === attendance_status.ABSENT) {
        throw new ConflictException('Học sinh này đã được báo vắng. Vui lòng kiểm tra lại báo cáo.');
    }

    await this.tripStudentRepository.update(
      { tripId: trip.id, studentId },
      { status: attendance_status.ATTENDED, attendedAt: new Date() },
    );
    return { ...attendanceRecord, status: attendance_status.ATTENDED };
  }

  // ========== API 6: Hoàn tác (Cập nhật chặn nếu đã vắng) ==========
  async undoAttendStudent(filter: ScheduleFilter, checkInDto: CheckInDto) {
    const trip = await this.findCurrentDriverTrip(filter);
    
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

    // Thêm: Chặn hoàn tác nếu là trạng thái VẮNG (ABSENT)
    // Việc sửa trạng thái vắng nên được thực hiện qua quy trình khác hoặc admin
    if (attendanceRecord.status === attendance_status.ABSENT) {
        throw new ConflictException('Không thể hoàn tác trạng thái vắng mặt từ đây.');
    }

    await this.tripStudentRepository.update(
      { tripId: trip.id, studentId },
      { status: attendance_status.PENDING, attendedAt: null },
    );
    return { ...attendanceRecord, status: attendance_status.PENDING };
  }

  // ========== API 7: Lịch tuần (Giữ nguyên) ==========
  async getWeeklySchedule(driverId: string, startDate: string, endDate: string) {
    const trips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('route.routeStops', 'routeStop')
      .leftJoinAndSelect('routeStop.stop', 'stop')
      .leftJoinAndSelect('trip.bus', 'bus')
      .where('trip.driverId = :driverId', { driverId })
      .andWhere('trip.tripDate >= :startDate', { startDate })
      .andWhere('trip.tripDate <= :endDate', { endDate })
      .orderBy('trip.tripDate', 'ASC')
      .addOrderBy('trip.session', 'ASC')
      .getMany();

    return trips.map((trip) => {
      let stops: { id: string; name: string; address: string }[] = [];

      if (trip.route && trip.route.routeStops) {
        stops = trip.route.routeStops
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .map((rs) => ({
            id: rs.stop.id,
            name: rs.stop.name,
            address: rs.stop.address,
          }));
      }

      return {
        id: trip.id,
        tripDate: trip.tripDate,
        session: trip.session,
        type: trip.type,
        route: trip.route ? trip.route.name : 'Chưa xếp tuyến',
        startTime: trip.actualStartTime
          ? format(new Date(trip.actualStartTime), 'HH:mm')
          : 'Dự kiến',
        status: trip.status,
        busLicense: trip.bus ? trip.bus.licensePlate : 'N/A',
        stops: stops,
      };
    });
  }

  // ========== API 8: Lấy danh sách học sinh tuần (Giữ nguyên logic đã sửa trước đó) ==========
// ========== API 8: Lấy danh sách học sinh tuần (ĐÃ FIX LỖI ĐỊA CHỈ) ==========
  async getWeeklyStudents(
    driverId: string,
    startDate: string,
    endDate: string,
  ) {
    const trips = await this.tripRepository.find({
      where: {
        driverId,
        tripDate: Between(startDate, endDate) as any,
      },
      relations: [
        'route',
        'bus',
        'tripStudents',
        'tripStudents.student',
        'tripStudents.student.pickupStop',
        'tripStudents.student.dropoffStop',
      ],
      order: {
        tripDate: 'ASC',
        session: 'ASC',
        type: 'ASC',
      },
    });

    const groupedByDate: Record<string, any[]> = {};

    trips.forEach((trip) => {
      const dateObj = new Date(trip.tripDate);
      const dateKey = dateObj.toISOString().split('T')[0];

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }

      const studentsList =
        (trip.tripStudents as unknown as TripStudent[]) || [];

const formattedStudents = studentsList.map((ts) => {
        const isPickup = trip.type === TripType.PICKUP;
        
        // 1. Xác định Stop dựa trên chiều đi
        const targetStop = isPickup ? ts.student.pickupStop : ts.student.dropoffStop;
        
        // 2. Lấy địa chỉ từ Stop (Bỏ qua student.address vì không có trong DB)
        // Ưu tiên lấy trường 'address' của Stop, nếu null thì lấy 'name'
        const finalAddress = targetStop?.address || targetStop?.name || 'Chưa cập nhật địa chỉ';

        return {
          id: ts.student.id,
          fullName: ts.student.fullName,
          address: finalAddress, // Kết quả: Sẽ hiển thị địa chỉ của trạm dừng
          status: ts.status,
          attendedAt: ts.attendedAt,
        };
      });

      groupedByDate[dateKey].push({
        tripId: trip.id,
        session: trip.session,
        type: trip.type,
        route: trip.route ? trip.route.name : 'Chưa xếp',
        status: trip.status,
        students: formattedStudents,
      });
    });

    return Object.keys(groupedByDate).map((date) => ({
      date: date,
      shifts: groupedByDate[date],
    }));
  }
}