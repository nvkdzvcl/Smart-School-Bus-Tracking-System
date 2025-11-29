// apps/driver-api/src/trip/trip.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';

import { Trip } from './trip.entity';
import { Route } from '../route/route.entity';
import { Report } from '../reports/entities/report.entity';
import { TripStudent } from './trip-student.entity';
import { TripStatus } from './trip.enums';

export interface TripHistoryBE {
  id: string;
  date: string;
  shift: string;
  route: string;
  startTime: string;
  endTime: string;
  totalStudents: number;
  pickedUp: number;
  droppedOff: number;
  distance: string;
  duration: string;
  incidents: number;
  status: 'completed' | 'incomplete';
}

export interface HistorySummary {
  totalTrips: number;
  completedTrips: number;
  totalIncidents: number;
}

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(TripStudent)
    private readonly tripStudentRepository: Repository<TripStudent>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async getHistoryListByUser(user: any): Promise<TripHistoryBE[]> {
    const driverId = user.userId;

    const rows = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoin('Routes', 'route', 'route.id = trip.route_id')
      .leftJoin(TripStudent, 'ts', 'ts.trip_id = trip.id')
      .leftJoin(Report, 'report', 'report.trip_id = trip.id')
      .leftJoin('trip.driver', 'driver')
      .leftJoin('trip.bus', 'bus')
      .where('trip.driver_id = :driverId', { driverId })
      .andWhere('trip.status IN (:...statuses)', {
        statuses: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      })
      .andWhere(`trip.trip_date >= NOW() - INTERVAL '30 day'`)
      .select([
        'trip.id AS id',
        'trip.trip_date AS date',
        'trip.session AS shift',
        'route.name AS route',
        'trip.actual_start_time AS "startTime"',
        'trip.actual_end_time AS "endTime"',
        'trip.status AS status',
        'driver.fullName AS "driverName"',
        'driver.phone AS "driverPhone"',
        'driver.email AS "driverEmail"',
        'bus.license_plate AS "licensePlate"',
        // Đếm
        'COUNT(DISTINCT ts.student_id) AS "totalStudents"', // (Đếm tổng học sinh VẪN ĐÚNG)

        // ĐÃ SỬA: Đếm số student_id DUY NHẤT CÓ status = 'attended'
        `COUNT(DISTINCT CASE WHEN ts.status = 'attended' THEN ts.student_id ELSE NULL END) AS "pickedUp"`,

        // ĐÃ SỬA: Tương tự
        `COUNT(DISTINCT CASE WHEN ts.status = 'attended' THEN ts.student_id ELSE NULL END) AS "droppedOff"`,

        'COUNT(DISTINCT report.id) AS "incidents"', // (Cũng nên dùng DISTINCT cho chắc)
      ])
      .groupBy('trip.id')
      .addGroupBy('route.name')
      .addGroupBy('driver.fullName')
      .addGroupBy('driver.phone')
      .addGroupBy('driver.email')
      .addGroupBy('bus.license_plate')
      .orderBy('trip.trip_date', 'DESC')
      .addOrderBy('trip.session', 'DESC')
      .getRawMany();

    return rows.map((h: any) => {
      const totalStudents = parseInt(h.totalStudents, 10) || 0;
      const pickedUp = parseInt(h.pickedUp, 10) || 0;
      const incidents = parseInt(h.incidents, 10) || 0;

      const start = h.startTime ? new Date(h.startTime) : null;
      const end = h.endTime ? new Date(h.endTime) : null;

      let duration = 'N/A';
      if (start && end) {
        // --- LOGIC SỬA ĐỂ TÍNH DURATION ---
        // 1. Làm tròn start XUỐNG phút gần nhất (bỏ giây/ms)
        const startFloored = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        );
        // (11:49:42 -> 11:49:00)

        // 2. Làm tròn end XUỐNG phút gần nhất (bỏ giây/ms)
        const endFloored = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
          end.getHours(),
          end.getMinutes(),
        );
        // (11:50:08 -> 11:50:00)

        // 3. Tính chênh lệch của 2 mốc thời gian đã làm tròn này
        const diffMin = Math.round(
          (endFloored.getTime() - startFloored.getTime()) / 60000,
        );
        // (11:50:00 - 11:49:00) = 1 phút

        duration = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
        // Kết quả sẽ là "0h 1m"
        // --- KẾT THÚC LOGIC SỬA ---
      }

      const status: 'completed' | 'incomplete' =
        h.status === TripStatus.COMPLETED ? 'completed' : 'incomplete';

      // Hàm này vẫn đúng, nó làm tròn xuống (floor) phút
      const toHHMM = (d: Date | null) =>
        d
          ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          : 'N/A';

      return {
        id: h.id,
        date: h.date,
        shift: h.shift === 'morning' ? 'Ca sáng' : 'Ca chiều',
        route: h.route || 'N/A',
        startTime: toHHMM(start), // Sẽ là "11:49"
        endTime: toHHMM(end), // Sẽ là "11:50"
        totalStudents,
        pickedUp,
        droppedOff: pickedUp,
        distance: `${(Math.random() * 5 + 10).toFixed(1)} km`,
        duration, // Sẽ là "0h 1m"
        incidents,
        status,
        driverName: h.driverName || 'N/A',
        driverPhone: h.driverPhone || 'N/A',
        driverEmail: h.driverEmail || 'N/A',
        licensePlate: h.licensePlate || 'N/A',
      };
    });
  }

  async getHistorySummaryByUser(user: any): Promise<HistorySummary> {
    const driverId = user.userId;

    const s = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoin(Report, 'report', 'report.trip_id = trip.id')
      .where('trip.driver_id = :driverId', { driverId })
      .andWhere('trip.status IN (:...statuses)', {
        statuses: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      })
      .andWhere(`trip.trip_date >= NOW() - INTERVAL '30 day'`)
      .select([
        'COUNT(DISTINCT trip.id) AS "totalTrips"',
        `COUNT(DISTINCT CASE WHEN trip.status = 'completed' THEN trip.id ELSE NULL END) AS "completedTrips"`,

        // ĐÃ SỬA: Xóa dấu phẩy ở cuối dòng này
        'COUNT(DISTINCT report.id) AS "totalIncidents"',

        // ĐÃ SỬA: Xóa dòng "nbsp;"
      ])
      .getRawOne();

    return {
      totalTrips: parseInt(s?.totalTrips, 10) || 0,
      completedTrips: parseInt(s?.completedTrips, 10) || 0,
      totalIncidents: parseInt(s?.totalIncidents, 10) || 0,
    };
  }

  /**
   * Lấy lịch trình của 1 học sinh trong khoảng thời gian
   * Kèm thông tin: Trip, Driver, Bus, Route
   */
  async getStudentSchedule(
    studentId: string,
    fromDate: string,
    toDate: string,
  ) {
    return (
      this.tripStudentRepository
        .createQueryBuilder('ts')
        // 1. Join bảng Trip để lấy thông tin chuyến đi
        .innerJoinAndSelect('ts.trip', 'trip')

        // 2. Join bảng Driver (User) và Bus từ Trip
        .leftJoinAndSelect('trip.driver', 'driver')
        .leftJoinAndSelect('trip.bus', 'bus')
        .leftJoinAndSelect('trip.route', 'route') // Lấy thêm tuyến đường nếu cần

        // 3. Điều kiện lọc: Theo ID học sinh
        .where('ts.studentId = :studentId', { studentId })

        // 4. Điều kiện lọc: Theo khoảng thời gian (from - to)
        .andWhere('trip.tripDate BETWEEN :fromDate AND :toDate', {
          fromDate,
          toDate,
        })

        // 5. Sắp xếp: Ngày tăng dần -> Giờ khởi hành tăng dần
        .orderBy('trip.tripDate', 'ASC')
        .addOrderBy('trip.actualStartTime', 'ASC')

        // 6. Chọn các trường cần thiết (Optional: Nếu muốn response gọn hơn)
        // .select([
        //   'ts.status', 'ts.attendedAt',
        //   'trip.id', 'trip.tripDate', 'trip.session', 'trip.type', 'trip.status',
        //   'driver.fullName', 'driver.phone',
        //   'bus.licensePlate'
        // ])

        .getMany()
    );
  }
  async getStudentsInCurrentTrip(driverId: string) {
    // Tìm chuyến đi đang IN_PROGRESS của tài xế hôm nay
    const activeTrip = await this.tripRepository.findOne({
      where: {
        driverId: driverId,
        tripDate: Raw((alias) => `${alias} = CURRENT_DATE`),
        status: TripStatus.IN_PROGRESS,
      },
      // Join bảng tripStudents và bảng student để lấy thông tin
      relations: ['tripStudents', 'tripStudents.student'], 
    });

    // Nếu không có chuyến nào đang chạy -> Trả về rỗng
    if (!activeTrip) {
      return [];
    }
    const students = activeTrip.tripStudents as any;
    // Map dữ liệu để trả về format gọn nhẹ cho Frontend
    return students.map((ts: any) => ({
      id: ts.student.id,
      full_name: ts.student.fullName,
      status: ts.status, 
      imageUrl: ts.student.imageUrl || null,
    }));
  }
}
