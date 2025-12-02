// src/chat/entities/conversation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Conversations') // Tên bảng trong DB
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  participant_1_id: string;

  @Column({ type: 'uuid', nullable: true })
  participant_2_id: string;

  @Column({ nullable: true })
  last_message_preview: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_message_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}