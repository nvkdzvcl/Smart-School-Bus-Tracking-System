import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // POST /messages
  @Post()
  @UsePipes(new ValidationPipe()) // Tự động validate body dùng DTO
  async create(@Body() createMessageDto: CreateMessageDto) {
    // Gọi service để xử lý logic
    return this.messagesService.create(createMessageDto);
  }

  // GET /messages/recipient/:id
  @Get('recipient/:id')
  async getByRecipient(@Param('id') id: string) {
    return await this.messagesService.getByRecipientId(id);
  }

  // GET /messages/conversation/:conversationId
  @Get('conversation/:conversationId')
  async getByConversation(@Param('conversationId') conversationId: string) {
    return await this.messagesService.getByConversationId(conversationId);
  }

  @Get('conversations')
  async getConversations() {
    // Ví dụ: trả về danh sách hội thoại duy nhất
    // Bạn có thể viết logic query từ bảng Message để group theo conversationId
    return await this.messagesService.getConversations();
  }
  
}
