import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Raw } from 'typeorm'
import { Report } from './entities/report.entity'
import { CreateReportDto } from './dto/create-report.dto'
import { Trip } from '../trip/trip.entity'
import { TripStatus, attendance_status } from '../trip/trip.enums'
import { Student } from '../student/student.entity'
import { Notification } from '../notification/notification.entity'
import { TripStudent } from '../trip/trip-student.entity'
import { ReportsGateway } from './reports.gateway'
import { ReportType } from './report.enums'
import { NotificationType } from '../notification/notification.enums'

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

    @InjectRepository(TripStudent)
    private readonly tripStudentRepository: Repository<TripStudent>,

    private readonly reportsGateway: ReportsGateway,
  ) { }

  async create(
    driverId: string,
    createReportDto: CreateReportDto,
    imageUrl?: string,
  ): Promise<Report> {
    const activeTrip = await this.findActiveDriverTrip(driverId)
    if (!activeTrip) {
      throw new BadRequestException(
        'Không tìm thấy chuyến đi nào đang hoạt động. Bạn chỉ có thể báo cáo khi chuyến đi đang chạy.',
      )
    }

    const newReport = this.reportRepository.create({
      ...createReportDto,
      senderId: driverId,
      tripId: activeTrip.id,
      imageUrl: imageUrl || undefined,
      studentId: createReportDto.studentId || undefined,
    })

    const savedReport = await this.reportRepository.save(newReport)

    if (createReportDto.type === ReportType.STUDENT_ABSENT && createReportDto.studentId) {
      await this.handleStudentAbsentNotification(createReportDto.studentId)
      await this.tripStudentRepository.update(
        { tripId: activeTrip.id, studentId: createReportDto.studentId },
        { status: attendance_status.ABSENT, attendedAt: null },
      )
    }

    this.reportsGateway.broadcastReportCreated(savedReport)
    return savedReport
  }

  private async handleStudentAbsentNotification(studentId: string) {
    try {
      const student = await this.studentRepository.findOne({ where: { id: studentId }, relations: ['parent'] })
      if (student && student.parentId) {
        const recipientUser = { id: student.parentId } as unknown as Notification['recipient']
        const notification = this.notificationRepository.create({
          recipient: recipientUser,
          title: 'Thông báo vắng mặt',
          message: `Phụ huynh em ${student.fullName} lưu ý: Tài xế vừa báo cáo học sinh vắng mặt tại điểm đón.`,
          type: NotificationType.ALERT,
          isRead: false,
        })
        await this.notificationRepository.save(notification)
        console.log(`[Notification] Đã gửi thông báo vắng cho PH của em ${student.fullName}`)
      }
    } catch (error) {
      console.error('Lỗi khi gửi thông báo vắng:', error)
    }
  }

  private async findActiveDriverTrip(driverId: string): Promise<Trip | null> {
    const trip = await this.tripRepository.findOne({
      where: { driverId: driverId, tripDate: Raw((alias) => `${alias} = CURRENT_DATE`), status: TripStatus.IN_PROGRESS },
      order: { session: 'ASC' },
    })
    return trip || null
  }

  async findAllByDriver(driverId: string): Promise<Report[]> {
    return this.reportRepository.find({ where: { senderId: driverId }, order: { createdAt: 'DESC' } })
  }

  async findByTripId(tripId: string, driverId: string) {
    const trip = await this.tripRepository.findOne({ where: { id: tripId, driverId: driverId } })
    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến đi hoặc bạn không có quyền xem báo cáo này.')
    }
    return this.reportRepository.find({
      where: { tripId: tripId },
      select: ['id', 'title', 'content', 'imageUrl', 'type'],
      order: { createdAt: 'ASC' },
    })
  }
}