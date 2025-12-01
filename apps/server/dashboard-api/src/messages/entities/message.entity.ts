import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/user.entity'
import { Conversation } from '../../conversations/entities/conversation.entity'

@Entity('Messages')
export class Message {
    @PrimaryGeneratedColumn('uuid') id: string
    @Column({ type: 'uuid', name: 'conversation_id' }) conversationId: string
    @Column({ type: 'uuid', name: 'sender_id', nullable: true }) senderId: string
    @Column({ type: 'uuid', name: 'recipient_id', nullable: true }) recipientId: string
    @Column({ type: 'text' }) content: string
    @Column({ type: 'boolean', name: 'is_read', default: false }) isRead: boolean
    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date
    @ManyToOne(() => Conversation, (convo) => convo.messages, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'conversation_id' }) conversation: Conversation
    @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'sender_id' }) sender: User
    @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'recipient_id' }) recipient: User
}
