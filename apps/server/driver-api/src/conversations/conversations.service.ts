import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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

  async createOrGetConversation(
    userId: string,
    partnerId: string,
  ): Promise<Conversation> {
    if (userId === partnerId) {
      throw new BadRequestException('Không thể tạo hội thoại với chính mình.');
    }

    // 1. TÌM KIẾM HỘI THOẠI HIỆN CÓ
    const existingConversation = await this.conversationRepository.findOne({
      where: [
        // Điều kiện 1: User (p1) và Partner (p2)
        { participant1Id: userId, participant2Id: partnerId },
        // Điều kiện 2: Partner (p1) và User (p2) (Đảo ngược)
        { participant1Id: partnerId, participant2Id: userId },
      ],
      relations: ['participant1', 'participant2'],
    });

    if (existingConversation) {
      // Nếu tìm thấy, trả về ngay
      return existingConversation;
    }

    // 2. NẾU CHƯA CÓ, TẠO HỘI THOẠI MỚI
    const newConversation = this.conversationRepository.create({
      participant1Id: userId,
      participant2Id: partnerId,
    });

    await this.conversationRepository.save(newConversation);

    // Lấy lại object với relations đã join để trả về Frontend
    const createdConvo = await this.conversationRepository.findOne({
      where: { id: newConversation.id },
      relations: ['participant1', 'participant2'],
    });

    // FIX LỖI Ở ĐÂY: Dùng if check để đảm bảo nó không null trước khi return
    // Dòng 64 của bạn là dòng return này.
    if (!createdConvo) {
      // Lỗi nghiêm trọng, vì object vừa tạo xong lại không lấy được
      throw new InternalServerErrorException(
        'Không thể lấy lại hội thoại vừa tạo.',
      );
    }

    return createdConvo; // Sẽ không còn lỗi vì đã đảm bảo non-null
  }

  async getOrCreateConversation(
    participant1Id: string,
    participant2Id: string,
  ) {
    // 1. Tìm xem đã có conversation 1-1 giữa 2 người chưa
    let conversation = await this.conversationRepository.findOne({
      where: [
        {
          participant1: { id: participant1Id },
          participant2: { id: participant2Id },
        },
        {
          participant1: { id: participant2Id },
          participant2: { id: participant1Id },
        },
      ],
      relations: ['participant1', 'participant2'],
    });

    // 2. Nếu chưa có -> tạo mới
    if (!conversation) {
      conversation = this.conversationRepository.create({
        participant1: { id: participant1Id } as any,
        participant2: { id: participant2Id } as any,
      });

      conversation = await this.conversationRepository.save(conversation);
      // load lại quan hệ cho chắc
      conversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['participant1', 'participant2'],
      });
    }

    return conversation;
  }
}
