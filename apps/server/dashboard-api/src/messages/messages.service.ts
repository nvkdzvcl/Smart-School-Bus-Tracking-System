import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Message } from './entities/message.entity'
import { CreateMessageDto } from './dto/create-message.dto'
import { Conversation } from '../conversations/entities/conversation.entity'
import { User } from '../user/user.entity'

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message) private messageRepository: Repository<Message>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Conversation) private convoRepo: Repository<Conversation>,
        private dataSource: DataSource,
    ) { }

    async create(dto: CreateMessageDto) {
        if (!dto.content?.trim()) throw new BadRequestException('Vui lòng nhập nội dung')
        // Must have existing conversation (đồng bộ với driver-api logic: FE tạo trước)
        const convo = await this.convoRepo.findOne({ where: { id: dto.conversationId } })
        if (!convo) throw new NotFoundException('Không tìm thấy cuộc hội thoại')
        const [sender, recipient] = await Promise.all([
            this.userRepo.findOne({ where: { id: dto.senderId } }),
            this.userRepo.findOne({ where: { id: dto.recipientId } }),
        ])
        if (!sender) throw new NotFoundException('Không tìm thấy người gửi')
        if (!recipient) throw new NotFoundException('Không tìm thấy người nhận')

        const qr = this.dataSource.createQueryRunner()
        await qr.connect(); await qr.startTransaction()
        try {
            const newMsg = this.messageRepository.create(dto)
            await qr.manager.save(newMsg)
            await qr.manager.update(Conversation, { id: dto.conversationId }, { lastMessagePreview: dto.content, lastMessageAt: newMsg.createdAt })
            await qr.commitTransaction()
            return newMsg
        } catch (e) { await qr.rollbackTransaction(); throw e } finally { await qr.release() }
    }

    async getByRecipientId(id: string) {
        return this.messageRepository.find({ where: { recipientId: id }, order: { createdAt: 'DESC' } })
    }

    async getByConversationId(conversationId: string) {
        if (!conversationId) return []
        const convo = await this.convoRepo.findOne({ where: { id: conversationId } })
        if (!convo) return []
        return this.messageRepository.find({ where: { conversationId }, order: { createdAt: 'ASC' }, relations: ['sender'] })
    }

    async getConversations() {
        const messages = await this.messageRepository.find({ order: { createdAt: 'DESC' }, relations: ['sender'] })
        const map = new Map<string, Message>()
        for (const m of messages) if (m.conversationId && !map.has(m.conversationId)) map.set(m.conversationId, m)
        return Array.from(map.values()).map(m => ({ id: m.conversationId, recipientName: m.sender?.fullName, lastMessage: m.content, timestamp: m.createdAt, unreadCount: 0 }))
    }
}
