// src/chat/chat.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
// Đây là DTO (Data Transfer Object) cho tin nhắn mới
// Bạn có thể tạo file `src/chat/dto/create-message.dto.ts` riêng
// hoặc để tạm ở đây cũng được.
export class CreateMessageDto {
  senderId: string;
  recipientId: string;
  content: string;
  conversationId?: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    
    // 2. Inject Repository Conversation vào đây
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

  async createMessage(data: CreateMessageDto): Promise<Message> {
    let conversationId = data.conversationId;

    // 🛑 LOGIC MỚI: TỰ TÌM HOẶC TẠO CONVERSATION NẾU BỊ NULL
    if (!conversationId) {
      // A. Thử tìm xem 2 người này đã có hội thoại chưa
      const existingConvo = await this.conversationRepo.findOne({
        where: [
          // Trường hợp 1: A là user 1, B là user 2
          { participant_1_id: data.senderId, participant_2_id: data.recipientId },
          { participant_1_id: data.recipientId, participant_2_id: data.senderId },
          // Trường hợp 2: Ngược lại (nếu DB lưu không theo thứ tự)
          { participant_1_id: data.recipientId, participant_2_id: data.senderId },
          { participant_1_id: data.senderId, participant_2_id: data.recipientId },
        ],
      });

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        // B. Nếu chưa có -> TẠO MỚI LUÔN
        const newConvo = this.conversationRepo.create({
          participant_1_id: data.senderId,
          participant_2_id: data.recipientId,
          last_message_at: new Date(),
          last_message_preview: data.content // Lưu luôn tin nhắn cuối
        });
        const savedConvo = await this.conversationRepo.save(newConvo);
        conversationId = savedConvo.id;
      }
    } else {
      // C. Nếu đã có ID, cập nhật lại thời gian và tin nhắn cuối cho conversation đó
      await this.conversationRepo.update(conversationId, {
        last_message_at: new Date(),
        last_message_preview: data.content
      });
    }

    // 3. Lưu tin nhắn với conversationId chắc chắn đã có
    const newMessage = this.messageRepo.create({
      sender_id: data.senderId,
      recipient_id: data.recipientId,
      content: data.content,
      conversation_id: conversationId, // <--- Lúc này biến này chắc chắn có giá trị
    });

    const savedMessage = await this.messageRepo.save(newMessage);

    return this.messageRepo.findOneOrFail({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });
  }

  /**
   * Lấy lịch sử cuộc trò chuyện giữa 2 người
   * @param userId1 ID người dùng 1
   * @param userId2 ID người dùng 2
   * @returns Mảng các tin nhắn
   */
  async getConversation(
    userId1: string,
    userId2: string,
  ): Promise<Message[]> {
    return this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender') // Lấy cả thông tin người gửi
      .where(
        // Tìm tin nhắn 2 chiều
        '(msg.sender_id = :userId1 AND msg.recipient_id = :userId2) OR (msg.sender_id = :userId2 AND msg.recipient_id = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('msg.created_at', 'ASC') // Sắp xếp từ cũ nhất
      .getMany();
  }

  /**
   * MỚI: Đánh dấu tất cả tin nhắn từ 1 người là đã đọc
/**
   * MỚI: Đánh dấu tất cả tin nhắn từ 1 người là đã đọc
   */
/**
   * MỚI: Đánh dấu tất cả tin nhắn từ 1 người là đã đọc
   * Sử dụng QueryBuilder để tránh xung đột giữa Column và Relation
   */
  async markConversationAsRead(senderId: string, recipientId: string): Promise<void> {
    console.log(`DEBUG BE: Bắt đầu đánh dấu đã đọc [Sender: ${senderId}] -> [Me: ${recipientId}]`);

    // Dùng createQueryBuilder để bắn thẳng lệnh SQL update vào DB
    const result = await this.messageRepo.createQueryBuilder()
      .update(Message)
      .set({ is_read: true }) // Cập nhật cột is_read thành true
      .where("sender_id = :senderId", { senderId })
      .andWhere("recipient_id = :recipientId", { recipientId })
      .andWhere("is_read = :isRead", { isRead: false })
      .execute();

    console.log(`DEBUG BE: Số tin nhắn đã cập nhật:`, result.affected);
  }
}