import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    // 3. (Nâng cao) Tiêm DataSource để dùng Transaction
    private dataSource: DataSource,
  ) { }

  async create(createMessageDto: CreateMessageDto) {
    // Sử dụng transaction để đảm bảo cả 2 thao tác (Tạo Message VÀ Cập nhật Conversation)
    // hoặc cùng thành công, hoặc cùng thất bại.

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // BƯỚC 1: Tạo và lưu tin nhắn mới
      const newMessage = this.messageRepository.create(createMessageDto);
      // Lưu tin nhắn này bằng 'queryRunner.manager'
      await queryRunner.manager.save(newMessage);

      // BƯỚC 2: Cập nhật bảng 'Conversations'
      // Đây là bước CỰC KỲ QUAN TRỌNG để 'ConversationList' của bạn hoạt động
      await queryRunner.manager.update(
        Conversation,
        { id: createMessageDto.conversationId }, // Điều kiện tìm
        {
          // Dữ liệu cập nhật
          lastMessagePreview: createMessageDto.content,
          lastMessageAt: newMessage.createdAt, // Dùng thời gian của tin nhắn mới
        },
      );

      // Nếu mọi thứ thành công, commit transaction
      await queryRunner.commitTransaction();

      // Trả về tin nhắn vừa tạo
      return newMessage;
    } catch (err) {
      // Nếu có lỗi, rollback (hoàn tác) mọi thay đổi
      await queryRunner.rollbackTransaction();
      throw err; // Báo lỗi
    } finally {
      // Luôn giải phóng queryRunner
      await queryRunner.release();
    }
  }
  async getByRecipientId(id: string) {
    return await this.messageRepository.find({
      where: { recipientId: id },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getByConversationId(conversationId: string) {
    return await this.messageRepository.find({
      where: { conversationId: conversationId },
      order: {
        createdAt: 'ASC', // Sắp xếp theo ngày tạo, cũ nhất lên đầu
      },
      // (Tùy chọn) Tải kèm thông tin người gửi
      relations: ['sender'],
    });
  }

  async getConversations() {
    // Lấy tất cả messages, group theo conversationId
    const messages = await this.messageRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['sender'], // nếu cần
    });

    // Giả sử bạn muốn lấy lastMessage cho mỗi conversation
    const map = new Map<string, Message>();
    for (const msg of messages) {
      if (!map.has(msg.conversationId)) {
        map.set(msg.conversationId, msg);
      }
    }

    return Array.from(map.values()).map((msg) => ({
      id: msg.conversationId,
      recipientName: msg.sender.fullName, // hoặc lấy từ quan hệ khác
      lastMessage: msg.content,
      timestamp: msg.createdAt,
      unreadCount: 0, // tuỳ logic
    }));
  }
}
