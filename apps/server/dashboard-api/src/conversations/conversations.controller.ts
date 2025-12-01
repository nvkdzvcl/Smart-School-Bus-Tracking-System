import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common'
import { ConversationsService } from './conversations.service'

@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Get('user/:userId')
    getConversationsForUser(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.conversationsService.getByUserId(userId)
    }

    @Post('get-or-create')
    getOrCreate(@Body() body: { userAId: string; userBId: string }) {
        return this.conversationsService.getOrCreate(body.userAId, body.userBId)
    }
}
