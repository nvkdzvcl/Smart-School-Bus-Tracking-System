export class Chat {}
// src/chat/entities/message.entity.ts

// 🛑 QUAN TRỌNG: Hãy đảm bảo đường dẫn này đúng với project của bạn
import { User } from '../../user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Messages') // Map với bảng "Messages" trong DB
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  conversation_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'uuid' })
  recipient_id: string;

  @Column('text')
  content: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  // --- Quan hệ ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' }) // Tên cột foreign key
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' }) // Tên cột foreign key
  recipient: User;
}