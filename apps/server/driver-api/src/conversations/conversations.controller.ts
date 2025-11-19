import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * API Endpoint: GET /api/conversations/user/:userId
   * Lấy tất cả các cuộc hội thoại cho một user ID cụ thể.
   */
  @Get('user/:userId')
  async getConversationsForUser(
    // ParseUUIDPipe sẽ validate id có phải là UUID hợp lệ không
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    // Gọi service
    const conversations = await this.conversationsService.getByUserId(userId);

    // (Tùy chọn) Bạn có thể biến đổi dữ liệu ở đây trước khi trả về
    // Ví dụ: để frontend không cần tính toán "người nhận là ai"

    // Trả về dữ liệu
    // Frontend sẽ nhận được một mảng các [Conversation]
    // đã bao gồm 2 object lồng nhau là [participant1] và [participant2]
    return conversations;
  }
}
