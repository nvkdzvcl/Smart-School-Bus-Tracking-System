import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from './trip.entity'
import { Student } from '../students/student.entity'
import { AttendanceStatus } from '../common/enums'

@Entity('Trip_Students')
export class TripStudent {
  @PrimaryColumn({ name: 'trip_id', type: 'uuid' }) tripId: string
  @PrimaryColumn({ name: 'student_id', type: 'uuid' }) studentId: string

  @Column({ type: 'enum', enum: [AttendanceStatus.PENDING, AttendanceStatus.ATTENDED, AttendanceStatus.ABSENT], enumName: 'attendance_status', name: 'status', default: AttendanceStatus.PENDING })
  status: AttendanceStatus

  @Column({ name: 'attended_at', type: 'timestamptz', nullable: true }) attendedAt?: Date

  @ManyToOne(() => Trip, t => t.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' }) trip: Trip

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' }) student: Student
}
