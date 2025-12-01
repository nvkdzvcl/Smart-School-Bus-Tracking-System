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

  @Column({
    type: 'enum',
    enum: [UserRole.MANAGER, UserRole.DRIVER, UserRole.PARENT],
    enumName: 'user_role',
    name: 'role'
  })
  role: UserRole

  // --- CẬP NHẬT THÔNG TIN BẰNG LÁI ---
  @Column({ name: 'license_number', nullable: true })
  licenseNumber?: string

  @Column({ name: 'license_class', nullable: true, length: 50 })
  licenseClass?: string

  @Column({ name: 'license_expiry', type: 'date', nullable: true })
  licenseExpiry?: Date
  // ------------------------------------

  @Column({ name: 'fcm_token', nullable: true })
  fcmToken: string

  // Cập nhật trạng thái theo yêu cầu: Active (Đang làm việc), Inactive (Nghỉ phép), Locked (Khóa)
  @Column({
    type: 'enum',
    enumName: 'user_status',
    enum: ['active', 'inactive', 'locked'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'locked'
}