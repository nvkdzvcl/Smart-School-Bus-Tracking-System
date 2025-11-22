import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './message.entity'
import { User } from '../user/user.entity'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
