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
import { TripStatus, attendance_status } from '../trip/trip.enums'; // 👈 Import thêm attendance_status
import { Student } from '../student/student.entity';
import { Notification } from '../notification/notification.entity';
import { User } from '../user/user.entity'; 
import { TripStudent } from '../trip/trip-student.entity'; // 👈 Import Entity TripStudent

import { ReportType } from './report.enums'; 
import { NotificationType } from '../notification/notification.enums'; 

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    // 👇 1. Inject thêm Repository TripStudent để update trạng thái vắng
    @InjectRepository(TripStudent)
    private readonly tripStudentRepository: Repository<TripStudent>,
  ) {}

  async create(
    driverId: string,
    createReportDto: CreateReportDto,
    imageUrl?: string,
  ): Promise<Report> {
    
    // 1. Tìm chuyến đi active
    const activeTrip = await this.findActiveDriverTrip(driverId);

    if (!activeTrip) {
      throw new BadRequestException(
        'Không tìm thấy chuyến đi nào đang hoạt động. Bạn chỉ có thể báo cáo khi chuyến đi đang chạy.',
      );
    }

    // 2. Tạo Report
    const newReport = this.reportRepository.create({
      ...createReportDto,
      senderId: driverId,
      tripId: activeTrip.id,
      imageUrl: imageUrl || undefined,
      studentId: createReportDto.studentId || undefined,
    });
    
    const savedReport = await this.reportRepository.save(newReport);

    // 3. Logic xử lý khi báo Vắng
    if (
      createReportDto.type === ReportType.STUDENT_ABSENT && 
      createReportDto.studentId
    ) {
      // a. Gửi thông báo cho phụ huynh
      await this.handleStudentAbsentNotification(createReportDto.studentId);

      // b. 👇 QUAN TRỌNG: Update trạng thái điểm danh thành ABSENT
      await this.tripStudentRepository.update(
        { 
          tripId: activeTrip.id, 
          studentId: createReportDto.studentId 
        },
        { 
          status: attendance_status.ABSENT, // Chuyển sang vắng
          attendedAt: null // Xóa giờ điểm danh (nếu lỡ có)
        }
      );
    }

    return savedReport;
  }

  private async handleStudentAbsentNotification(studentId: string) {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
        relations: ['parent'],
      });

      if (student && student.parentId) {
        // Ép kiểu any cho recipient để tránh lỗi import User entity (như đã fix trước đó)
        const recipientUser = { id: student.parentId } as any;

        const notification = this.notificationRepository.create({
          recipient: recipientUser, 
          title: 'Thông báo vắng mặt',
          message: `Phụ huynh em ${student.fullName} lưu ý: Tài xế vừa báo cáo học sinh vắng mặt tại điểm đón.`,
          type: NotificationType.ALERT, 
          isRead: false,
        });

        await this.notificationRepository.save(notification);
        console.log(`[Notification] Đã gửi thông báo vắng cho PH của em ${student.fullName}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi thông báo vắng:', error);
    }
  }

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

  async findByTripId(tripId: string, driverId: string) {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, driverId: driverId },
    });

    if (!trip) {
      throw new NotFoundException(
        'Không tìm thấy chuyến đi hoặc bạn không có quyền xem báo cáo này.',
      );
    }

    return this.reportRepository.find({
      where: { tripId: tripId },
      select: ['id', 'title', 'content', 'imageUrl', 'type'],
      order: { createdAt: 'ASC' },
    });
  }
}