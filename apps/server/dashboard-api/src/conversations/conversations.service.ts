import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Conversation } from './entities/conversation.entity'

@Injectable()
export class ConversationsService {
    constructor(
        @InjectRepository(Conversation) private convoRepo: Repository<Conversation>
    ) { }

    async getByUserId(userId: string): Promise<Conversation[]> {
        return this.convoRepo.find({
            where: [{ participant1Id: userId }, { participant2Id: userId }],
            relations: ['participant1', 'participant2'],
            order: { lastMessageAt: 'DESC' }
        })
    }

    async getOrCreate(userAId: string, userBId: string) {
        if (!userAId || !userBId) throw new Error('user ids required')
        const [p1, p2] = [userAId, userBId].sort() // keep unique ordering
        let convo = await this.convoRepo.findOne({ where: { participant1Id: p1, participant2Id: p2 } })
        if (convo) return convo
        convo = this.convoRepo.create({ participant1Id: p1, participant2Id: p2 })
        return this.convoRepo.save(convo)
    }
}
