// apps/driver-api/src/reports/reports.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm'; 
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
   * @param driverId ID của tài xế (người gửi)
   * @param createReportDto Dữ liệu tạo Report (title, content, type, studentId)
   * @param imageUrl Đường dẫn (URL) của hình ảnh đã được upload (nếu có)
   */
  async create(
    driverId: string,
    createReportDto: CreateReportDto,
    imageUrl?: string, 
  ): Promise<Report> {
    
    // 1. Tự động tìm chuyến đi đang hoạt động (in_progress)
    const activeTrip = await this.findActiveDriverTrip(driverId);

    if (!activeTrip) {
      throw new BadRequestException(
        'Không tìm thấy chuyến đi nào đang hoạt động. Bạn chỉ có thể báo cáo khi chuyến đi đang chạy.',
      );
    }

    // 2. Tạo entity Report mới
    // LỖI TS2769: Khắc phục bằng cách dùng 'imageUrl || undefined'
    const newReport = this.reportRepository.create({
      ...createReportDto, 
      senderId: driverId,
      tripId: activeTrip.id,
      imageUrl: imageUrl || undefined, // Đã sửa: Không dùng null
    });

    // 3. Lưu vào database
    // LỖI TS2740: Khắc phục bằng cách ép kiểu rõ ràng về Promise<Report>
    return (await this.reportRepository.save(newReport)) as Report; 
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
      order: { createdAt: 'DESC' }, 
    });
  }

  // 👇 THÊM TOÀN BỘ HÀM NÀY VÀO CUỐI CLASS 👇
  async findByTripId(tripId: string, driverId: string) {
    // 1. Kiểm tra xem chuyến đi có tồn tại và thuộc tài xế này không
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, driverId: driverId },
    });

    // Nếu không tìm thấy chuyến đi hoặc không đúng tài xế -> báo lỗi
    if (!trip) {
      throw new NotFoundException(
        'Không tìm thấy chuyến đi hoặc bạn không có quyền xem báo cáo này.',
      );
    }

    // 2. Nếu đúng, lấy tất cả báo cáo của chuyến đi đó
    return this.reportRepository.find({
      where: { tripId: tripId },
      // Chỉ lấy các cột mà FE (file History.tsx) cần cho PDF
      select: ['id', 'title', 'content', 'imageUrl', 'type'], 
      order: { createdAt: 'ASC' }, // Sắp xếp theo thời gian
    });
  }
}