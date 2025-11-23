import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { TimestampedEntity } from '../common/base.entity'
import { Route } from '../routes/route.entity'
import { Bus } from '../buses/bus.entity'
import { User } from '../user/user.entity'
import { DayPart, TripType, TripStatus } from '../common/enums'
import { TripStudent } from './trip-student.entity'

@Entity('Trips')
export class Trip extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => Route, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'route_id' }) route?: Route

  @ManyToOne(() => Bus, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bus_id' }) bus?: Bus

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'driver_id' }) driver?: User

  @Column({ name: 'trip_date', type: 'date' }) tripDate: string

  @Column({ type: 'enum', enum: [DayPart.MORNING, DayPart.AFTERNOON], enumName: 'day_part', name: 'session' }) session: DayPart

  @Column({ type: 'enum', enum: [TripType.PICKUP, TripType.DROPOFF], enumName: 'trip_type', name: 'type' }) type: TripType

  @Column({ type: 'enum', enum: [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS, TripStatus.COMPLETED, TripStatus.CANCELLED], enumName: 'trip_status', name: 'status', default: TripStatus.SCHEDULED }) status: TripStatus

  @Column({ name: 'actual_start_time', type: 'timestamptz', nullable: true }) actualStartTime?: Date
  @Column({ name: 'actual_end_time', type: 'timestamptz', nullable: true }) actualEndTime?: Date

  @OneToMany(() => TripStudent, ts => ts.trip) students: TripStudent[]
}
