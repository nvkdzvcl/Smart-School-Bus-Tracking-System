// apps/driver-api/src/user/user.entity.ts

import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole, UserStatus } from './user.roles.enum';
import { OneToMany } from 'typeorm';
import { Student } from 'src/student/student.entity';
import { Notification } from 'src/notification/notification.entity';

@Entity('Users') // Dùng dấu ngoặc kép vì tên bảng có chữ "U" hoa
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Đổi sang 'string' vì nó là UUID

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ unique: true })
  phone: string; // 'phone' là SĐT, sẽ dùng để đăng nhập

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ name: 'password_hash' }) // Map với cột 'password_hash'
  @Exclude() // Tự động giấu trường này khi trả về JSON
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole, // Dùng kiểu 'enum'
    name: 'role',
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE, // Mặc định là active
  })
  status: UserStatus;

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Tạm thời bỏ qua các quan hệ (relations)
  @OneToMany(() => Student, (student) => student.parent)
  students: Student[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];
}
