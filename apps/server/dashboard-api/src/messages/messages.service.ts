import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from './message.entity'
import { User } from '../user/user.entity'

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message) private msgRepo: Repository<Message>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    findAll() { return this.msgRepo.find({ relations: ['sender', 'recipient'] }) }

    async findOne(id: string) {
        const m = await this.msgRepo.findOne({ where: { id }, relations: ['sender', 'recipient'] })
        if (!m) throw new NotFoundException('Message not found')
        return m
    }

    async send(data: { senderId: string; recipientId: string; content: string; conversationId?: string }) {
        const sender = await this.userRepo.findOne({ where: { id: data.senderId } })
        const recipient = await this.userRepo.findOne({ where: { id: data.recipientId } })
        const entity = this.msgRepo.create({ content: data.content, conversationId: data.conversationId })
        if (sender) entity.sender = sender
        if (recipient) entity.recipient = recipient
        return this.msgRepo.save(entity)
    }

    async markRead(id: string) {
        const m = await this.findOne(id)
        m.isRead = true
        return this.msgRepo.save(m)
    }

    async remove(id: string) {
        const m = await this.findOne(id)
        await this.msgRepo.remove(m)
        return { deleted: true }
    }
}
