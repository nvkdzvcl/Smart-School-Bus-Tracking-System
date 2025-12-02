import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Student } from 'src/student/student.entity';
import { Trip } from 'src/trip/trip.entity';
import { TripStudent } from 'src/trip/trip-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Trip, TripStudent])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
