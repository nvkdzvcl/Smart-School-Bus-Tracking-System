import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Conversation } from './entities/conversation.entity'
import { User } from '../user/user.entity'

@Injectable()
export class ConversationsService {
    constructor(
        @InjectRepository(Conversation) private convoRepo: Repository<Conversation>,
        @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async getByUserId(userId: string): Promise<Conversation[]> {
        return this.convoRepo.find({
            where: [{ participant1Id: userId }, { participant2Id: userId }],
            relations: ['participant1', 'participant2'],
            order: { lastMessageAt: 'DESC' }
        })
    }

    async getOrCreate(userAId: string, userBId: string) {
        try {
            if (!userAId || !userBId) throw new Error('user ids required')

            // Validate users exist
            const [userA, userB] = await Promise.all([
                this.userRepo.findOne({ where: { id: userAId } }),
                this.userRepo.findOne({ where: { id: userBId } })
            ])

            if (!userA) throw new NotFoundException(`User not found: ${userAId}`)
            if (!userB) throw new NotFoundException(`User not found: ${userBId}`)

            const [p1, p2] = [userAId, userBId].sort() // keep unique ordering
            let convo = await this.convoRepo.findOne({ where: { participant1Id: p1, participant2Id: p2 } })
            if (convo) return convo
            convo = this.convoRepo.create({ participant1Id: p1, participant2Id: p2 })
            return await this.convoRepo.save(convo)
        } catch (error) {
            console.error('Error in getOrCreate conversation:', error)
            throw error
        }
    }
}
