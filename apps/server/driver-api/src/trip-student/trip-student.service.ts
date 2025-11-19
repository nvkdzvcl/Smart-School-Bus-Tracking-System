import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripStudent } from 'src/trip/trip-student.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TripStudentService {
  constructor(
    @InjectRepository(TripStudent)
    private readonly tripStudentRepo: Repository<TripStudent>,
  ) {}

  async getRecentAttendance(studentId: string, limit = 5) {
    const records = await this.tripStudentRepo.find({
      where: { studentId: studentId },
      relations: ['trip'],
      order: { trip: { actualStartTime: 'DESC' } },
      take: limit,
    });

    // Map lại dữ liệu để chỉ trả về ngày giờ + trạng thái
    return records.map((rec) => ({
      id: rec.tripId,
      date:
        rec.attendedAt ??
        rec.trip?.actualStartTime ??
        rec.trip?.tripDate ??
        null,
      status: rec.status,
    }));
  }
}
