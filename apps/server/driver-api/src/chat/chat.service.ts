// src/chat/chat.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

// Đây là DTO (Data Transfer Object) cho tin nhắn mới
// Bạn có thể tạo file `src/chat/dto/create-message.dto.ts` riêng
// hoặc để tạm ở đây cũng được.
export class CreateMessageDto {
  senderId: string;
  recipientId: string;
  content: string;
}

@Injectable()
export class ChatService {
  constructor(
    // Tiêm (Inject) Repository của Message
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  /**
   * Lưu một tin nhắn mới vào database
   * @param data Dữ liệu tin nhắn gồm senderId, recipientId, content
   * @returns Tin nhắn đã lưu (kèm thông tin sender)
   */
  async createMessage(data: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepo.create({
      sender_id: data.senderId,
      recipient_id: data.recipientId,
      content: data.content,
    });

    // Lưu vào DB
    const savedMessage = await this.messageRepo.save(newMessage);

    // Lấy lại tin nhắn vừa lưu KÈM theo thông tin 'sender'
    // để gửi về cho client hiển thị (biết ai là người gửi)
    return this.messageRepo.findOneOrFail({
      where: { id: savedMessage.id },
      relations: ['sender'], // Lấy thông tin người gửi
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
   */
  async markConversationAsRead(senderId: string, recipientId: string): Promise<void> {
    await this.messageRepo.update(
      {
        // Điều kiện tìm:
        sender_id: senderId,
        recipient_id: recipientId,
        is_read: false,
      },
      {
        // Cập nhật:
        is_read: true,
      },
    );
  }
}