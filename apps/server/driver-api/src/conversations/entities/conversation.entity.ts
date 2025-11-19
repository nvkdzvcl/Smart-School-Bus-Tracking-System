import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('Conversations')
// Thêm Index cho constraint UNIQUE (mặc dù logic LEAST/GREATEST phức tạp
// nên được xử lý ở DB, TypeORM có thể nhận biết constraint)
@Index('uq_participants_index', ['participant1Id', 'participant2Id'], {
  unique: true,
})
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'participant_1_id', nullable: true })
  participant1Id: string;

  @Column({ type: 'uuid', name: 'participant_2_id', nullable: true })
  participant2Id: string;

  @Column({ type: 'text', name: 'last_message_preview', nullable: true })
  lastMessagePreview: string;

  @Column({
    type: 'timestamptz',
    name: 'last_message_at',
    default: () => 'NOW()',
  })
  lastMessageAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // --- Quan hệ ---

  // Quan hệ với Người tham gia 1
  @ManyToOne(() => User, {
    onDelete: 'SET NULL', // Khi User bị xóa, set cột này thành NULL
  })
  @JoinColumn({ name: 'participant_1_id' })
  participant1: User;

  // Quan hệ với Người tham gia 2
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'participant_2_id' })
  participant2: User;

  // Quan hệ ngược lại với Messages
  // Một cuộc hội thoại có thể có nhiều tin nhắn
  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true, // Tùy chọn: Nếu xóa conversation thì xóa cả message
  })
  messages: Message[];
}
