import { Exclude } from 'class-transformer'
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { UserRole } from '../common/enums'
import { TimestampedEntity } from '../common/base.entity'

@Entity('Users')
export class User extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'full_name', nullable: true })
  fullName: string

  @Column({ unique: true })
  phone: string

  @Column({ unique: true, nullable: true })
  email: string

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string

  @Column({ type: 'enum', enum: [UserRole.MANAGER, UserRole.DRIVER, UserRole.PARENT], enumName: 'user_role', name: 'role' })
  role: UserRole

  @Column({ name: 'license_number', nullable: true })
  licenseNumber?: string // chỉ áp dụng cho tài xế (driver), phụ huynh & quản lý để null

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string
}
