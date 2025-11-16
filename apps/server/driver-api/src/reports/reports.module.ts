// apps/driver-api/src/reports/reports.module.ts

import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Trip } from '../trip/trip.entity'; // <-- THÊM VÀO
import { AuthModule } from '../auth/auth.module'; // <-- THÊM VÀO

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      Trip, // <-- THÊM VÀO
    ]),
    AuthModule, // <-- THÊM VÀO (để AuthGuard hoạt động)
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}