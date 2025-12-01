// src/chat/chat.gateway.ts

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, CreateMessageDto } from './chat.service';
import { Logger } from '@nestjs/common';

// 🛑 BƯỚC 1: Import AuthService
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true, // TODO: Đổi lại địa chỉ ReactJS (FE) sau
  },
  namespace: 'chat', // Chỉ xử lý kết nối đến /chat
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // Biến server để gửi tin nhắn

  private logger = new Logger('ChatGateway');

  // Dùng để lưu trữ user đang online
  // Key: userId (string, UUID)
  // Value: socket.id (string)
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    // 🛑 BƯỚC 2: Tiêm (Inject) AuthService vào
    private readonly authService: AuthService,
  ) {}

  /**
   * Xử lý khi client kết nối (ĐÂY LÀ PHẦN THAY ĐỔI LỚN)
   */
async handleConnection(client: Socket) {
    this.logger.log(`Client ${client.id} đang cố gắng kết nối...`);
    try {
      // --- PHẦN XÁC THỰC MỚI (Đọc từ "auth" object) ---

      // 1. Lấy token từ "auth" (do socket.io-client gửi lên)
      const token = client.handshake.auth.token;
      
      if (!token) {
        throw new Error('Không có token xác thực trong "auth"');
      }
      
      // ------------------------------------------

      // 2. Dùng AuthService để xác thực token (giữ nguyên)
      const userPayload = await this.authService.verifyToken(token);
      
      const userId = userPayload.sub; 

      if (!userId) {
        throw new Error('Token không hợp lệ hoặc không có user ID');
      }

      // 3. Lưu user vào map (giữ nguyên)
      this.connectedUsers.set(userId, client.id);

      this.logger.log(`Client ${client.id} (User: ${userId}) đã kết nối thành công.`);

      // 4. Gửi sự kiện (giữ nguyên)
      client.emit('connected', { userId });

    } catch (error) {
      this.logger.error(`Kết nối thất bại: ${error.message}`);
      client.disconnect(true); // Ngắt kết nối ngay
    }
  }

  /**
   * Xử lý khi client ngắt kết nối
   */
  handleDisconnect(client: Socket) {
    // Tìm và xóa user khỏi map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`Client ${client.id} (User: ${userId}) đã ngắt kết nối`);
        break;
      }
    }
  }


/**
   * MỚI: Lắng nghe sự kiện 'getHistory'
   * Khi client yêu cầu lịch sử chat với ai đó
   */
  @SubscribeMessage('getHistory')
  async handleGetHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { otherUserId: string },
  ) {
    // 1. Lấy senderId (người yêu cầu)
    let senderId: string | undefined = undefined;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        senderId = userId;
        break;
      }
    }

    if (!senderId || !payload.otherUserId) {
      return client.emit('error', 'Không thể tải lịch sử');
    }

    this.logger.log(`[${senderId}] yêu cầu lịch sử với [${payload.otherUserId}]`);

    // 2. Dùng ChatService để lấy cuộc trò chuyện
    const history = await this.chatService.getConversation(
      senderId,
      payload.otherUserId,
    );

    // 3. Gửi lịch sử về CHỈ cho client đó
    client.emit('history', history);
  }


  /**
   * Lắng nghe sự kiện 'sendMessage' (Phần này không đổi)
   */
/**
   * Lắng nghe sự kiện 'sendMessage'
   * (ĐÃ CẬP NHẬT: Nhận thêm conversationId từ Client)
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    // 1. Cập nhật kiểu dữ liệu payload để nhận conversationId
    @MessageBody() payload: { recipientId: string; content: string; conversationId?: string },
  ) {
    // 2. Lấy senderId (người gửi) từ map (đã xác thực lúc kết nối)
    let senderId: string | undefined = undefined;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        senderId = userId;
        break;
      }
    }

    if (!senderId) {
      return client.emit('error', 'Lỗi: Không thể xác định người gửi.');
    }

    // 3. Destructure lấy conversationId
    const { recipientId, content, conversationId } = payload;
    
    this.logger.log(`[${senderId}] -> [${recipientId}] (Convo: ${conversationId}): ${content}`);

    try {
      // 4. Tạo DTO và truyền conversationId vào Service
      const messageDto: CreateMessageDto = {
        senderId,
        recipientId,
        content,
        conversationId, // <--- QUAN TRỌNG: Truyền cái này xuống Service
      };
      
      const savedMessage = await this.chatService.createMessage(messageDto);

      // 5. Tìm socket của người nhận (nếu họ online)
      const recipientSocketId = this.connectedUsers.get(recipientId);

      if (recipientSocketId) {
        // Nếu online, gửi tin nhắn real-time cho họ
        this.server
          .to(recipientSocketId)
          .emit('newMessage', savedMessage);
      } else {
        // Nếu offline (sau này làm Push Notification ở đây)
        this.logger.warn(`User ${recipientId} đang offline.`);
      }

      // 6. Gửi lại tin nhắn cho chính người gửi (để xác nhận đã gửi OK và cập nhật UI)
      client.emit('messageSent', savedMessage);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi tin nhắn: ${error.message}`);
      client.emit('error', 'Gửi tin nhắn thất bại');
    }
  }

  /**
   * MỚI: Lắng nghe sự kiện 'markAsRead'
   * Khi client mở một cuộc hội thoại
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { senderId: string }, // ID của người đã gửi tin nhắn
  ) {
    // 1. Lấy ID của người nhận (chính là tài xế đang xem)
    let recipientId: string | undefined = undefined;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        recipientId = userId;
        break;
      }
    }

    if (!recipientId || !payload.senderId) {
      return client.emit('error', 'Không thể đánh dấu đã đọc');
    }

    // 2. Gọi service để cập nhật DB
    try {
      await this.chatService.markConversationAsRead(
        payload.senderId, // Người gửi
        recipientId,      // Người nhận (là mình)
      );
      this.logger.log(`[${recipientId}] đã đọc tin nhắn từ [${payload.senderId}]`);
    } catch (err) {
      this.logger.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  }
}