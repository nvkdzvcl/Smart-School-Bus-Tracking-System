// src/chat/chat.module.ts

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';

// 🛑 IMPORT AuthModule
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    AuthModule, // <--- THÊM VÀO ĐÂY
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}