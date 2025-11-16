// apps/driver-api/src/route/route.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RouteStop } from './route-stop.entity'; // Import file tiếp theo

@Entity('Routes') // Tên bảng có chữ hoa
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Quan hệ 1-Nhiều với bảng nối "Route_Stops"
  @OneToMany(() => RouteStop, (routeStop) => routeStop.route)
  routeStops: RouteStop[];
}