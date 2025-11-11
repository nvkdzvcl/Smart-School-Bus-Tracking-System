// apps/driver-api/src/reports/reports.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm'; // <-- THÊM 'Raw' VÀO ĐÂY
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Trip } from '../trip/trip.entity';
import { TripStatus } from '../trip/trip.enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  /**
   * Tạo một báo cáo sự cố mới
   */
  async create(
    driverId: string,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    
    // 1. Tự động tìm chuyến đi đang hoạt động (in_progress)
    const activeTrip = await this.findActiveDriverTrip(driverId);

    if (!activeTrip) {
      throw new BadRequestException(
        'Không tìm thấy chuyến đi nào đang hoạt động. Bạn chỉ có thể báo cáo khi chuyến đi đang chạy.',
      );
    }

    // 2. Tạo entity Report mới
    const newReport = this.reportRepository.create({
      ...createReportDto, // title, content, type, studentId
      senderId: driverId,
      tripId: activeTrip.id,
    });

    // 3. Lưu vào database
    return this.reportRepository.save(newReport);
  }

  /**
   * Hàm hỗ trợ: Tìm chuyến đi 'in_progress' của tài xế
   */
  private async findActiveDriverTrip(driverId: string): Promise<Trip | null> {
    const trip = await this.tripRepository.findOne({
      where: {
        driverId: driverId,
        tripDate: Raw((alias) => `${alias} = CURRENT_DATE`),
        status: TripStatus.IN_PROGRESS,
      },
      order: {
        session: 'ASC',
      },
    });

    return trip || null;
  }

  async findAllByDriver(driverId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { senderId: driverId },
      order: { createdAt: 'DESC' }, // Sắp xếp mới nhất lên đầu
    });
  }
}