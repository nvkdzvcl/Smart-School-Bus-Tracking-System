import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './entities/conversation.entity'
import { User } from '../user/user.entity'
import { ConversationsService } from './conversations.service'
import { ConversationsController } from './conversations.controller'

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, User])],
    controllers: [ConversationsController],
    providers: [ConversationsService],
    exports: [ConversationsService]
})
export class ConversationsModule { }
