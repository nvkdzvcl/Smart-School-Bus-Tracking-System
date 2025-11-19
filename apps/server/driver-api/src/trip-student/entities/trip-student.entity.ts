import { Trip } from 'src/trip/trip.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'Trip_Students' })
export class TripStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_id: string;

  @Column()
  trip_id: string;

  @Column({ type: 'enum', enum: ['pending', 'attended', 'absent'] })
  status: 'pending' | 'attended' | 'absent';

  @Column({ type: 'timestamp', nullable: true })
  attended_at?: Date;

  @ManyToOne(() => Trip, (trip) => trip.tripStudents)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;
}
