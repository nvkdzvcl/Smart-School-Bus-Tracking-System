import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Route } from '../../route/route.entity';
import { Bus } from '../../bus/bus.entity';
import { User } from '../../user/user.entity';
import { TripType, TripStatus, DayPart } from '../trip.enums';
import { TripStudent } from '../trip-student.entity';
import { Report } from '../../reports/entities/report.entity';
import { BusLocation } from 'src/bus-location/entities/bus-location.entity';

@Entity('Trips')
@Index(['driverId', 'tripDate', 'type', 'session'])
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'route_id', nullable: true }) routeId: string | null;
  @Column({ name: 'bus_id', nullable: true }) busId: string | null;
  @Column({ name: 'driver_id', nullable: true }) driverId: string | null;

  @Column({ name: 'trip_date', type: 'date' }) tripDate: Date;

  @Column({ name: 'type', type: 'enum', enum: TripType, enumName: 'trip_type' })
  type: TripType;

  @Column({
    name: 'session',
    type: 'enum',
    enum: DayPart,
    enumName: 'day_part',
    default: DayPart.MORNING,
  })
  session: DayPart;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TripStatus,
    enumName: 'trip_status',
    default: TripStatus.SCHEDULED,
  })
  status: TripStatus;

  @Column({ name: 'actual_start_time', type: 'timestamptz', nullable: true })
  actualStartTime: Date | null;
  @Column({ name: 'actual_end_time', type: 'timestamptz', nullable: true })
  actualEndTime: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Route) @JoinColumn({ name: 'route_id' }) route: Route;
  @ManyToOne(() => Bus) @JoinColumn({ name: 'bus_id' }) bus: Bus;
  @ManyToOne(() => User) @JoinColumn({ name: 'driver_id' }) driver: User;

  // 👇 thêm 2 quan hệ ngược
  @OneToMany(() => TripStudent, (ts) => ts.trip)
  tripStudents: TripStudent[];

  @OneToMany(() => Report, (r) => r.trip)
  reports: Report[];

  @OneToMany(() => BusLocation, (location) => location.trip)
  locations: BusLocation[];
}
