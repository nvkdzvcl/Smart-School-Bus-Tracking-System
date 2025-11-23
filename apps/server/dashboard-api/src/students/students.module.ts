import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from './student.entity'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { User } from '../user/user.entity'
import { Stop } from '../stops/stops.entity'
import { Route } from '../routes/route.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, Stop, Route])],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService]
})
export class StudentsModule { }
