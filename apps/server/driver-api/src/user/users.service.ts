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
    // 0. (optional) kiểm tra student có tồn tại không
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) {
      return null; // hoặc throw NotFoundException
    }

    // 1. Lấy tất cả TripStudent của học sinh này
    const tripStudents = await this.tripStudentRepo.find({
      where: { studentId: studentId },
    });

    if (tripStudents.length === 0) {
      return null;
    }

    // console.log('student: ', student);
    console.log('tripStudents: ', tripStudents);

    const tripIds = tripStudents.map((ts) => ts.tripId);
    console.log('tripIds: ..............', tripIds);

    // 2. Tạo ngày hôm nay (Date) – đúng kiểu với tripDate: Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Lấy các trip hôm nay, status scheduled/in_progress
    const trips = await this.tripRepo.find({
      where: {
        id: In(tripIds),
        tripDate: today,
        status: In([TripStatus.SCHEDULED, TripStatus.IN_PROGRESS]),
      },
      relations: ['route'],
      order: {
        createdAt: 'DESC',
      },
    });
    console.log('trips: ', trips);

    if (trips.length === 0) {
      return null;
    }

    // 4. Ưu tiên trip đang chạy trước, rồi đến scheduled
    const activeTrip =
      trips.find((t) => t.status === TripStatus.IN_PROGRESS) ??
      trips.find((t) => t.status === TripStatus.SCHEDULED);

    if (!activeTrip) {
      return null;
    }

    // 5. Chuẩn hóa data trả về cho FE
    return {
      id: activeTrip.id,
      route_id: activeTrip.routeId,
      route_name: activeTrip.route?.name ?? null,
      bus_id: activeTrip.busId,
      trip_date: activeTrip.tripDate,
      session: activeTrip.session,
      type: activeTrip.type,
      status: activeTrip.status,
    };
  }
}
