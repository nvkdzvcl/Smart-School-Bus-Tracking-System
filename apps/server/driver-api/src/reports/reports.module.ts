import { Module } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { ReportsController } from './reports.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './entities/report.entity'
import { Trip } from '../trip/trip.entity'
import { AuthModule } from '../auth/auth.module'
import { Student } from '../student/student.entity'
import { Notification } from '../notification/notification.entity'
import { TripStudent } from '../trip/trip-student.entity'
import { ReportsGateway } from './reports.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      Trip,
      Student,
      Notification,
      TripStudent,
    ]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsGateway],
})
export class ReportsModule { }