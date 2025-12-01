import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { TimestampedEntity } from '../common/base.entity'
import { RouteStop } from './route-stop.entity'

@Entity('Routes')
export class Route extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) name: string
  @Column({ type: 'varchar', length: 255, nullable: true }) description?: string
  @Column({ type: 'varchar', length: 20, default: 'active' }) status: string
  @OneToMany(() => RouteStop, (rs) => rs.route, { cascade: true }) stops: RouteStop[]
}
