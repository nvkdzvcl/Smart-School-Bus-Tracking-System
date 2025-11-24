import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép Frontend kết nối (CORS)
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  // 1. Sự kiện: Tham gia vào cuộc hội thoại
  // Client gửi: socket.emit('join_conversation', { conversationId: '...' })
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId); // Cho socket này vào "phòng" conversationId
    console.log(`Client ${client.id} joined room ${data.conversationId}`);
  }

  // 2. Sự kiện: Rời khỏi cuộc hội thoại
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);
  }

  // 3. Sự kiện: Gửi tin nhắn
  // Client gửi: socket.emit('send_message', { content: '...', ... })
  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    // A. Lưu tin nhắn vào Database (quan trọng!)
    const savedMessage = await this.messagesService.create(createMessageDto);

    // B. Gửi tin nhắn vừa lưu cho TẤT CẢ mọi người trong phòng (kể cả người gửi)
    // Sự kiện tên là 'new_message'
    this.server
      .to(createMessageDto.conversationId)
      .emit('new_message', savedMessage);

    return savedMessage;
  }
}
