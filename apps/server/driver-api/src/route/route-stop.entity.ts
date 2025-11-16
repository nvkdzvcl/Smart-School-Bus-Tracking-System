// apps/driver-api/src/route/route-stop.entity.ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from './route.entity';
import { Stop } from './stop.entity';

@Entity('Route_Stops') // Tên bảng có chữ hoa
export class RouteStop {
  @PrimaryColumn({ name: 'route_id' })
  routeId: string;

  @PrimaryColumn({ name: 'stop_id' })
  stopId: string;

  @Column({ name: 'stop_order' })
  stopOrder: number;

  // Quan hệ N-1 với Route
  @ManyToOne(() => Route, (route) => route.routeStops)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  // Quan hệ N-1 với Stop
  @ManyToOne(() => Stop)
  @JoinColumn({ name: 'stop_id' })
  stop: Stop;
}