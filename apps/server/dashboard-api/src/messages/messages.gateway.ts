import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'

@WebSocketGateway({
    cors: { origin: '*' }
})
export class MessagesGateway {
    @WebSocketServer() server: Server
    constructor(private readonly messagesService: MessagesService) { }

    @SubscribeMessage('join_conversation')
    handleJoin(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: Socket
    ) {
        if (data.conversationId) {
            client.join(data.conversationId)
            // (Tuỳ chọn) gửi lịch sử về ngay
            this.messagesService.getByConversationId(data.conversationId).then(history => {
                client.emit('conversation_history', history)
            })
        }
    }

    @SubscribeMessage('leave_conversation')
    handleLeave(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: Socket
    ) { if (data.conversationId) client.leave(data.conversationId) }

    @SubscribeMessage('send_message')
    async handleSend(@MessageBody() dto: CreateMessageDto) {
        const saved = await this.messagesService.create(dto)
        if (saved.conversationId) {
            this.server.to(saved.conversationId).emit('new_message', saved)
        } else {
            // broadcast chung nếu không có conversation (notification)
            this.server.emit('new_message', saved)
        }
        return saved
    }

    // Lấy lịch sử thủ công
    @SubscribeMessage('get_history')
    async handleHistory(@MessageBody() data: { conversationId: string }) {
        if (!data.conversationId) return []
        return this.messagesService.getByConversationId(data.conversationId)
    }
}
