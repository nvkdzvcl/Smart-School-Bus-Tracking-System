import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm'
import { Message } from '../../messages/entities/message.entity'
import { User } from '../../user/user.entity'

@Entity('Conversations')
@Index('uq_participants_index', ['participant1Id', 'participant2Id'], { unique: true })
export class Conversation {
    @PrimaryGeneratedColumn('uuid') id: string

    @Column({ type: 'uuid', name: 'participant_1_id', nullable: true }) participant1Id: string
    @Column({ type: 'uuid', name: 'participant_2_id', nullable: true }) participant2Id: string

    @Column({ type: 'text', name: 'last_message_preview', nullable: true }) lastMessagePreview: string
    @Column({ type: 'timestamptz', name: 'last_message_at', default: () => 'NOW()' }) lastMessageAt: Date

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date
    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' }) updatedAt: Date

    @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'participant_1_id' }) participant1: User
    @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'participant_2_id' }) participant2: User

    @OneToMany(() => Message, (m) => m.conversation, { cascade: true }) messages: Message[]
}
