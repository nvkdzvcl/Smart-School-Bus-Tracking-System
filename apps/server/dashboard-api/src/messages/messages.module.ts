import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './entities/message.entity'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { User } from '../user/user.entity'
import { Conversation } from '../conversations/entities/conversation.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, Conversation])],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService]
})
export class MessagesModule { }
