import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Body() dto: CreateMessageDto) { return this.messagesService.create(dto) }

    @Get('recipient/:id')
    getByRecipient(@Param('id') id: string) { return this.messagesService.getByRecipientId(id) }

    @Get('conversation/:conversationId')
    getByConversation(@Param('conversationId') conversationId: string) { return this.messagesService.getByConversationId(conversationId) }

    @Get('conversations')
    getConversations() { return this.messagesService.getConversations() }
}
