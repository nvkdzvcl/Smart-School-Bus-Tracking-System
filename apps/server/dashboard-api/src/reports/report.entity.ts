import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'
import { Trip } from '../trips/trip.entity'
import { Student } from '../students/student.entity'
import { ReportType, ReportStatus } from '../common/enums'
import { TimestampedEntity } from '../common/base.entity'

@Entity('Reports')
export class Report extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' }) sender?: User

  @ManyToOne(() => Trip, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trip_id' }) trip?: Trip

  @ManyToOne(() => Student, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_id' }) student?: Student

  @Column({ nullable: false }) title: string
  @Column({ type: 'text', nullable: false }) content: string

  @Column({ type: 'enum', enum: [
    ReportType.STUDENT_ABSENT,
    ReportType.INCIDENT_TRAFFIC,
    ReportType.INCIDENT_VEHICLE,
    ReportType.INCIDENT_ACCIDENT,
    ReportType.COMPLAINT,
    ReportType.OTHER
  ], enumName: 'report_type', name: 'type' }) type: ReportType

  @Column({ type: 'enum', enum: [ReportStatus.PENDING, ReportStatus.RESOLVED], enumName: 'report_status', name: 'status', default: ReportStatus.PENDING }) status: ReportStatus

  @Column({ name: 'image_url', nullable: true }) imageUrl?: string
}
