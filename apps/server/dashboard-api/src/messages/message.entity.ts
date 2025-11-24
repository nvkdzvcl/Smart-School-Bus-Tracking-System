import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'

@Entity('Messages')
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ name: 'conversation_id', type: 'uuid', nullable: true }) conversationId?: string

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' }) sender?: User

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recipient_id' }) recipient?: User

  @Column({ type: 'text' }) content: string

  @Column({ name: 'is_read', type: 'boolean', default: false }) isRead: boolean

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' }) createdAt: Date
}
