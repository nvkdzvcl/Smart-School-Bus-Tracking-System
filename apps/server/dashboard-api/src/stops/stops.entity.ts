import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { TimestampedEntity } from '../common/base.entity'

@Entity('Stops')
export class Stop extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: true })
  address: string

  @Column({ type: 'decimal', precision: 9, scale: 6, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  latitude: number

  @Column({ type: 'decimal', precision: 9, scale: 6, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  longitude: number
}
