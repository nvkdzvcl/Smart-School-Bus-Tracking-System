import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { TimestampedEntity } from '../common/base.entity'
import { RouteStop } from './route-stop.entity'

@Entity('Routes')
export class Route extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) name: string

  @Column({ nullable: true })
  description?: string

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'inactive'

  @OneToMany(() => RouteStop, rs => rs.route) stops: RouteStop[]
}
