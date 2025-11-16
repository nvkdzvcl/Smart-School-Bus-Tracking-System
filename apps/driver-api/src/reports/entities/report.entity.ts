// apps/driver-api/src/reports/entities/report.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Trip } from '../../trip/trip.entity';
import { Student } from '../../student/student.entity';
import { ReportType, ReportStatus } from '../report.enums';

@Index('idx_reports_sender_created', ['senderId', 'createdAt'])
@Entity({ name: 'Reports' }) // trùng table "Reports" trong DB
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @Column({ type: 'uuid', name: 'trip_id', nullable: true })
  tripId?: string;

  @Column({ type: 'uuid', name: 'student_id', nullable: true })
  studentId?: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ReportType,
    enumName: 'report_type',     // 👈 map đúng PostgreSQL enum
  })
  type: ReportType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status',   // 👈 map đúng PostgreSQL enum
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  // Giữ 255 để khớp DB hiện tại (nếu muốn 512 thì ALTER TABLE ở DB)
  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // --- Quan hệ ---
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Trip, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ManyToOne(() => Student, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
