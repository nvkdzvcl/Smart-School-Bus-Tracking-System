import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'
import { NotificationType } from '../common/enums'

@Entity('Notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' }) recipient: User

  @Column({ nullable: true }) title?: string
  @Column({ type: 'text' }) message: string

  @Column({ type: 'enum', enum: [NotificationType.ALERT, NotificationType.ARRIVAL, NotificationType.MESSAGE, NotificationType.INCIDENT], enumName: 'notification_type', name: 'type' })
  type: NotificationType

  @Column({ name: 'is_read', type: 'boolean', default: false }) isRead: boolean

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' }) createdAt: Date
}
