// apps/driver-api/src/student/student.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Stop } from '../route/stop.entity';
import { TripStudent } from 'src/trip/trip-student.entity';

@Entity('Students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ name: 'pickup_stop_id', nullable: true })
  pickupStopId: string;

  @Column({ name: 'dropoff_stop_id', nullable: true })
  dropoffStopId: string;

  @Column({ name: 'class', nullable: true }) // (Tùy chọn) Thêm class nếu DB có
  class: string;

  // --- THÊM PHẦN NÀY ---
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;
  // ---------------------

  @Column({ name: 'route_id', nullable: true }) // (Nên thêm) Để biết học sinh thuộc tuyến nào
  routeId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Quan hệ ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @ManyToOne(() => Stop)
  @JoinColumn({ name: 'pickup_stop_id' })
  pickupStop: Stop;

  @ManyToOne(() => Stop)
  @JoinColumn({ name: 'dropoff_stop_id' })
  dropoffStop: Stop;

  @OneToMany(() => TripStudent, (tripStudent) => tripStudent.student)
  tripStudents: TripStudent[];
}
