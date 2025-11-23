import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { TimestampedEntity } from '../common/base.entity'
import { User } from '../user/user.entity'
import { Stop } from '../stops/stops.entity'
import { Route } from '../routes/route.entity'

@Entity('Students')
export class Student extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ name: 'full_name' }) fullName: string

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' }) parent?: User

  @ManyToOne(() => Stop, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pickup_stop_id' }) pickupStop?: Stop

  @ManyToOne(() => Stop, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dropoff_stop_id' }) dropoffStop?: Stop

  @Column({ name: 'class', nullable: true })
  class?: string

  @Column({ type: 'enum', enum: ['active','inactive'], name: 'status', default: 'active' })
  status!: 'active' | 'inactive'

  @ManyToOne(() => Route, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'route_id' })
  route?: Route
}