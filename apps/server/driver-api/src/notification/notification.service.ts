// src/notification/notification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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

  // --- HÀM MỚI ---
  // Đánh dấu 1 thông báo là đã đọc
  async markAsRead(notificationId: string, driverId: string) {
    // 1. Tìm thông báo
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        recipientId: driverId, // Quan trọng: Đảm bảo thông báo này là của tài xế
      },
    });

    // 2. Nếu không tìm thấy (hoặc không thuộc về tài xế)
    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo.');
    }

    // 3. Nếu nó chưa đọc, thì đánh dấu là đã đọc
    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }

    return { message: 'Đã đánh dấu là đã đọc', notification };
  }

  async getByUserId(userId: string) {
    return this.notificationRepository.find({
      where: [{ recipientId: userId }, { recipientId: IsNull() }],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
