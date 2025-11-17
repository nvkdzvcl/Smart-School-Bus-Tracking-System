import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Entity('Messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId: string;

  @Column({ type: 'uuid', name: 'sender_id', nullable: true })
  senderId: string;

  @Column({ type: 'uuid', name: 'recipient_id', nullable: true })
  recipientId: string;

  @Column({ type: 'text' }) // NOT NULL là mặc định
  content: string;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Conversation, (convo) => convo.messages, {
    onDelete: 'CASCADE', // Nếu xóa hội thoại, xóa luôn tin nhắn này
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // Quan hệ với Người gửi (User)
  @ManyToOne(() => User, {
    onDelete: 'SET NULL', // Tương đương FOREIGN KEY ... ON DELETE SET NULL
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // Quan hệ với Người nhận (User)
  @ManyToOne(() => User, {
    onDelete: 'SET NULL', // Tương đương FOREIGN KEY ... ON DELETE SET NULL
  })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
}
