// apps/driver-api/src/bus/bus.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BusStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

@Entity('Buses') // Tên bảng có chữ hoa
export class Bus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'license_plate', unique: true })
  licensePlate: string;

  @Column()
  capacity: number;

  @Column({
    type: 'enum',
    enum: BusStatus,
    default: BusStatus.ACTIVE,
  })
  status: BusStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}