import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async getMyChildrenWithTodayTrips(parentId: string) {
    const today = new Date().toISOString().split('T')[0];

    return (
      this.studentRepository
        .createQueryBuilder('student')
        .where('student.parentId = :parentId', { parentId })

        // Join thông tin cơ bản
        .leftJoinAndSelect('student.pickupStop', 'pickupStop')
        .leftJoinAndSelect('student.dropoffStop', 'dropoffStop')
        .leftJoinAndSelect('student.tripStudents', 'ts')

        // Join Trip (có lọc ngày)
        .leftJoinAndSelect('ts.trip', 'trip', 'trip.tripDate = :today', {
          today,
        })

        // === BỔ SUNG ĐỂ LẤY DRIVER & BUS ===
        // Lưu ý: 'trip' ở đây là alias (tên định danh) bạn đã đặt ở dòng trên
        .leftJoinAndSelect('trip.driver', 'driver') // Lấy thông tin Tài xế
        .leftJoinAndSelect('trip.bus', 'bus') // Lấy thông tin Xe
        .leftJoinAndSelect('trip.route', 'route') // (Nên thêm) Lấy tên tuyến đường
        // ====================================

        .orderBy('trip.actualStartTime', 'ASC')
        .getMany()
    );
  }
}
