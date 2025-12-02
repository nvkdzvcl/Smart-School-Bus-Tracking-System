import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { Trip } from './trip.entity';
import { TripStudent } from './trip-student.entity';
import { Report } from '../reports/entities/report.entity';
import { User } from '../user/user.entity';
import { Route } from '../route/route.entity'; // << THÊM IMPORT THIẾU NÀY
import { BusLocation } from 'src/bus-location/entities/bus-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trip,
      TripStudent,
      Report,
      User,
      Route, // << THÊM ENTITY ROUTE
      BusLocation,
    ]),
  ],
  controllers: [TripController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}
