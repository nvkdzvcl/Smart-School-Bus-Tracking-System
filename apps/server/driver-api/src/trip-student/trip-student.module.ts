import { Module } from '@nestjs/common';
import { TripStudentService } from './trip-student.service';
import { TripStudentController } from './trip-student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripStudent } from 'src/trip/trip-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripStudent])],
  controllers: [TripStudentController],
  providers: [TripStudentService],
})
export class TripStudentModule {}
