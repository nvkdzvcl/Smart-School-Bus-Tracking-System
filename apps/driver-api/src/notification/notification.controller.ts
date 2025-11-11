import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport'; // Import "Bảo vệ"

@Controller('notifications') // Đường dẫn API: /notifications
@UseGuards(AuthGuard('jwt')) // "Khóa" tất cả API trong đây
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Tạo API: GET /notifications
  @Get()
  getNotifications(@Req() req) {
    // Lấy ID tài xế từ token
    const driverId = req.user.userId;
    return this.notificationService.getForDriver(driverId);
  }
}