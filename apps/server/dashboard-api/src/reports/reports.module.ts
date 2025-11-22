import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './report.entity'
import { User } from '../user/user.entity'
import { Trip } from '../trips/trip.entity'
import { Student } from '../students/student.entity'
import { ReportsService } from './reports.service'
import { ReportsController } from './reports.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Trip, Student])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
