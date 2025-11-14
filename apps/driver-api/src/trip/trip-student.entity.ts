// apps/driver-api/src/trip/trip-student.entity.ts
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
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
    enumName: 'attendance_status',
    default: attendance_status.PENDING,
  })
  status: attendance_status;

  @Column({ name: 'attended_at', type: 'timestamptz', nullable: true })
  attendedAt: Date | null;

  // 👇 KHÔNG truyền (t) => t.tripStudents để tránh TS kiểm tra thuộc tính
  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
