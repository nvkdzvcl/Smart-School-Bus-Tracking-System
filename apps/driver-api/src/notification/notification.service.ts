import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // Lấy 5 thông báo mới nhất cho tài xế
  async getForDriver(driverId: string) {
    return this.notificationRepository.find({
      where: {
        recipientId: driverId,
      },
      order: {
        createdAt: 'DESC', // Sắp xếp: Mới nhất lên đầu
      },
      take: 5, // Chỉ lấy 5 cái
    });
  }
}