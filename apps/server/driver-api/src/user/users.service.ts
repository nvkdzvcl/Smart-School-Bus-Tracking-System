import { Injectable } from '@nestjs/common';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Student } from 'src/student/student.entity';
import { Trip } from 'src/trip/trip.entity';
import { TripStudent } from 'src/trip/trip-student.entity';
import { TripStatus } from 'src/trip/trip.enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    @InjectRepository(TripStudent)
    private readonly tripStudentRepo: Repository<TripStudent>,
  ) {}

  async getById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['students'],
    });
  }

  async updateParentInfo(id: string, parent: Partial<User>) {
    await this.userRepository.update(id, {
      fullName: parent.fullName,
      phone: parent.phone,
      email: parent.email,
    });
    // Trả về bản ghi đã cập nhật
    return await this.getById(id);
  }

  async searchUsers(keyword: string) {
    return await this.userRepository.find({
      where: [
        // Trường hợp 1: Đúng Role VÀ trùng Tên
        {
          role: In(['driver', 'manager']),
          fullName: ILike(`%${keyword}%`), // ILike để tìm không phân biệt hoa thường
        },
        // HOẶC (OR)
        // Trường hợp 2: Đúng Role VÀ trùng SĐT
        {
          role: In(['driver', 'manager']),
          phone: ILike(`%${keyword}%`),
        },
      ],
    });
  }

  /**
   * Lấy chuyến hiện tại trong ngày cho 1 học sinh
   * Dùng bởi endpoint: GET /users/students/:studentId/current-trip
   */
  async getCurrentTripForStudent(studentId: string) {
    // 0. Kiểm tra student (Giữ nguyên)
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) {
      return null;
    }

    // 1. Lấy TripStudent (Giữ nguyên)
    const tripStudents = await this.tripStudentRepo.find({
      where: { studentId: studentId },
    });

    if (tripStudents.length === 0) {
      return null;
    }

    const tripIds = tripStudents.map((ts) => ts.tripId);

    // 2. Tạo ngày hôm nay (Giữ nguyên)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Query Trips (SỬA Ở ĐÂY)
    const trips = await this.tripRepo.find({
      where: {
        id: In(tripIds),
        tripDate: today,
        status: In([TripStatus.SCHEDULED, TripStatus.IN_PROGRESS]),
      },
      // === THÊM 'driver' VÀ 'bus' VÀO RELATIONS ===
      relations: ['route', 'driver', 'bus'],
      order: {
        createdAt: 'DESC',
      },
    });

    if (trips.length === 0) {
      return null;
    }

    // 4. Ưu tiên trip (Giữ nguyên)
    const activeTrip =
      trips.find((t) => t.status === TripStatus.IN_PROGRESS) ??
      trips.find((t) => t.status === TripStatus.SCHEDULED);

    if (!activeTrip) {
      return null;
    }

    // 5. Chuẩn hóa data (SỬA Ở ĐÂY)
    return {
      id: activeTrip.id,
      route_id: activeTrip.routeId,
      route_name: activeTrip.route?.name ?? null,
      bus_id: activeTrip.busId,
      trip_date: activeTrip.tripDate,
      session: activeTrip.session,
      type: activeTrip.type,
      status: activeTrip.status,
      // Thời gian dự kiến (nếu có)
      actualStartTime: activeTrip.actualStartTime,

      // === TRẢ VỀ THÔNG TIN TÀI XẾ VÀ XE ===
      // Frontend sẽ truy cập qua: trip.driver.fullName, trip.driver.phone
      driver: activeTrip.driver
        ? {
            id: activeTrip.driver.id,
            fullName: activeTrip.driver.fullName,
            phone: activeTrip.driver.phone,
          }
        : null,

      // Frontend sẽ truy cập qua: trip.bus.licensePlate
      bus: activeTrip.bus
        ? {
            id: activeTrip.bus.id,
            licensePlate: activeTrip.bus.licensePlate,
          }
        : null,
    };
  }
}
