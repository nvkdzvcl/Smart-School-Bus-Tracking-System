// apps/driver-api/src/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import các Entity MỚI
import { Trip } from '../trip/trip.entity';
import { Route } from '../route/route.entity';
import { Bus } from '../bus/bus.entity';
import { User } from '../user/user.entity';
import { Stop } from '../route/stop.entity'; // <-- 1. IMPORT THÊM
import { RouteStop } from '../route/route-stop.entity'; // <-- 2. IMPORT THÊM
import { Student } from '../student/student.entity'; // <-- 1. IMPORT THÊM
import { TripStudent } from '../trip/trip-student.entity'; // <-- 2. IMPORT THÊM

// Import AuthModule để dùng "Bảo vệ"
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // 3. THÊM 2 ENTITY BỊ THIẾU VÀO ĐÂY
    TypeOrmModule.forFeature([
      Trip,
      Route,
      RouteStop, // <-- Thêm vào
      Stop,      // <-- Thêm vào
      Bus,
      User,
      Student, // <-- 3. THÊM VÀO ĐÂY
      TripStudent, // <-- 4. THÊM VÀO ĐÂY
    ]),
    AuthModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}