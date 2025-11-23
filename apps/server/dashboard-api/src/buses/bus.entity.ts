import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { TimestampedEntity } from '../common/base.entity'
import { BusStatus } from '../common/enums'

@Entity('Buses')
export class Bus extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ name: 'license_plate', unique: true }) licensePlate: string

  @Column({ name: 'capacity', type: 'int' }) capacity: number

  @Column({ type: 'enum', enum: [BusStatus.ACTIVE, BusStatus.MAINTENANCE, BusStatus.INACTIVE], enumName: 'bus_status', default: BusStatus.ACTIVE })
  status: BusStatus
}
