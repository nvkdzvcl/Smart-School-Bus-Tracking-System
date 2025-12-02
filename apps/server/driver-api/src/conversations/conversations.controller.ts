import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

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

  @Post()
  async create(@Body() dto: CreateConversationDto, @Req() req) {
    // Lấy ID người dùng hiện tại từ token/session
    const userId = req.user.userId;

    return this.conversationsService.createOrGetConversation(
      userId,
      dto.partnerId,
    );
  }

  @Post('get-or-create')
  async getOrCreate(
    @Body() body: { participant1Id: string; participant2Id: string },
  ) {
    const { participant1Id, participant2Id } = body;
    return this.conversationsService.getOrCreateConversation(
      participant1Id,
      participant2Id,
    );
  }
}
