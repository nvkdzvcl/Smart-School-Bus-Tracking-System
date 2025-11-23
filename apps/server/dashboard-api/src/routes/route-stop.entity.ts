import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Route } from './route.entity'
import { Stop } from '../stops/stops.entity'

@Entity('Route_Stops')
export class RouteStop {
  @PrimaryColumn({ name: 'route_id', type: 'uuid' }) routeId: string
  @PrimaryColumn({ name: 'stop_id', type: 'uuid' }) stopId: string
  @Column({ name: 'stop_order', type: 'int' }) stopOrder: number

  @ManyToOne(() => Route, r => r.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' }) route: Route

  @ManyToOne(() => Stop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stop_id' }) stop: Stop
}
