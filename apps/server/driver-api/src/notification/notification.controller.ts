// src/notification/notification.controller.ts

import { Controller, Get, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport'; // Import "Bảo vệ"

@Controller('notifications') // Đường dẫn API: /notifications
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // API: GET /notifications
  @UseGuards(AuthGuard('jwt')) // "Khóa" tất cả API trong đây
  @Get()
  getNotifications(@Req() req) {
    // Lấy ID tài xế từ token
    const driverId = req.user.userId;
    return this.notificationService.getForDriver(driverId);
  }

  // --- API MỚI ---
  // API: PATCH /notifications/:id/read
  @UseGuards(AuthGuard('jwt')) // "Khóa" tất cả API trong đây
  @Patch(':id/read')
  markNotificationAsRead(
    @Req() req,
    @Param('id') notificationId: string, // Lấy :id từ URL
  ) {
    const driverId = req.user.userId;
    return this.notificationService.markAsRead(notificationId, driverId);
  }

  @Get('/users/:id')
  getByUserId(@Param('id') userId: string) {
    return this.notificationService.getByUserId(userId);
  }
}
