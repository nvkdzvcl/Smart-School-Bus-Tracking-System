import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Trip } from './trip.entity'
import { TripStudent } from './trip-student.entity'
import { Route } from '../routes/route.entity'
import { Bus } from '../buses/bus.entity'
import { User } from '../user/user.entity'
import { Student } from '../students/student.entity'
import { TripsService } from './trips.service'
import { TripsController } from './trips.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Trip, TripStudent, Route, Bus, User, Student])],
  providers: [TripsService],
  controllers: [TripsController],
  exports: [TripsService],
})
export class TripsModule {}
