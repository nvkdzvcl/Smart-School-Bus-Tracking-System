// import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { Trip } from './trip.entity';
// import { Student } from '../student/student.entity';

// // Lấy enum từ database.sql
// export enum attendance_status {
//   PENDING = 'pending',
//   ATTENDED = 'attended',
//   ABSENT = 'absent',
// }

// @Entity('Trip_Students') // Khớp tên bảng "Trip_Students"
// export class TripStudent {
//   @PrimaryColumn({ name: 'trip_id' })
//   tripId: string;

//   @PrimaryColumn({ name: 'student_id' })
//   studentId: string;

//   @Column({
//     type: 'enum',
//     enum: attendance_status,
//     default: attendance_status.PENDING,
//   })
//   status: attendance_status;

//   // --- SỬA LỖI Ở ĐÂY ---
//   @Column({ 
//     name: 'attended_at', 
//     type: 'timestamptz', // Phải "nói rõ" kiểu dữ liệu
//     nullable: true 
//   })
//   attendedAt: Date | null; // Kiểu TypeScript (cho phép null)

//   // Quan hệ
//   @ManyToOne(() => Trip)
//   @JoinColumn({ name: 'trip_id' })
//   trip: Trip;

//   @ManyToOne(() => Student)
//   @JoinColumn({ name: 'student_id' })
//   student: Student;
// }
// apps/driver-api/src/trip/trip-student.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Trip } from './trip.entity';
import { Student } from '../student/student.entity';
import { attendance_status } from './trip.enums';

@Entity('Trip_Students')
@Index(['tripId', 'studentId'])
export class TripStudent {
  @PrimaryColumn({ name: 'trip_id', type: 'uuid' })
  tripId: string;

  @PrimaryColumn({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: attendance_status,
    enumName: 'attendance_status', // <-- map đúng PostgreSQL enum type trong SQL
    default: attendance_status.PENDING,
  })
  status: attendance_status;

  @Column({
    name: 'attended_at',
    type: 'timestamptz',
    nullable: true,
  })
  attendedAt: Date | null;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
