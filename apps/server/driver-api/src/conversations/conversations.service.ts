import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async getByUserId(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: [
        // Điều kiện 1: User là người tham gia 1
        { participant1Id: userId },
        // Điều kiện 2: User là người tham gia 2
        { participant2Id: userId },
      ],
      // Tải kèm thông tin của cả 2 người tham gia
      relations: ['participant1', 'participant2'],

      // Sắp xếp để lấy cuộc hội thoại mới nhất lên đầu
      order: {
        lastMessageAt: 'DESC',
      },
    });
  }
}
