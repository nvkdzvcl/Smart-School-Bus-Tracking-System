import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]), // Đăng ký Entity
    AuthModule, // Import để dùng "Bảo vệ"
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}