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
    // 1. Lấy ngày hiện tại dạng 'YYYY-MM-DD' (khớp với kiểu DATE trong DB)
    // Lưu ý: Cần xử lý múi giờ nếu server không ở VN.
    // Ở đây giả sử server cùng múi giờ hoặc dùng UTC chuẩn.
    const today = new Date().toISOString().split('T')[0];

    return (
      this.studentRepository
        .createQueryBuilder('student')
        // 2. Điều kiện lọc: Chỉ lấy con của phụ huynh này
        .where('student.parentId = :parentId', { parentId })

        // 3. Join để lấy thông tin Điểm đón/Trả cố định
        .leftJoinAndSelect('student.pickupStop', 'pickupStop')
        .leftJoinAndSelect('student.dropoffStop', 'dropoffStop')

        // 4. Join bảng trung gian TripStudents
        .leftJoinAndSelect('student.tripStudents', 'ts')

        // 5. === QUAN TRỌNG ===
        // Join sang bảng Trips nhưng có điều kiện LỌC NGÀY ngay tại câu Join.
        // Kỹ thuật này giúp: Nếu trip không phải hôm nay -> trả về null,
        // nhưng vẫn giữ lại record student.
        .leftJoinAndSelect('ts.trip', 'trip', 'trip.tripDate = :today', {
          today,
        })

        // 7. Sắp xếp: Ưu tiên sáng trước chiều
        .orderBy('trip.actualStartTime', 'ASC')

        .getMany()
    );
  }
}
