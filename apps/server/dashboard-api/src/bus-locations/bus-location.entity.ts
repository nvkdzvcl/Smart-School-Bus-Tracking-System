import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from '../trips/trip.entity'

@Entity('Bus_Locations')
export class BusLocation {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string | number
  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' }) trip: Trip
  @Column({ type: 'decimal', precision: 9, scale: 6 }) latitude: string
  @Column({ type: 'decimal', precision: 9, scale: 6 }) longitude: string
  @Column({ name: 'timestamp', type: 'timestamptz', default: () => 'NOW()' }) timestamp: Date
}
