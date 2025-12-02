import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from 'src/trip/trip.entity';

@Entity('Bus_Locations')
export class BusLocation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('uuid', { name: 'trip_id' })
  tripId: string;

  @Column('decimal', { precision: 9, scale: 6 })
  latitude: string;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp: Date;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;
}
