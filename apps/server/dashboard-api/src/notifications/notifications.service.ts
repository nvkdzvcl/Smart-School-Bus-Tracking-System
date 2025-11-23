import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './notification.entity'
import { User } from '../user/user.entity'
import { NotificationType } from '../common/enums'

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification) private notifRepo: Repository<Notification>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    findAll() { return this.notifRepo.find({ relations: ['recipient'] }) }

    async findOne(id: string) {
        const n = await this.notifRepo.findOne({ where: { id }, relations: ['recipient'] })
        if (!n) throw new NotFoundException('Notification not found')
        return n
    }

    async create(data: { recipientId: string; title?: string; message: string; type: NotificationType }) {
        const recipient = await this.userRepo.findOne({ where: { id: data.recipientId } })
        if (!recipient) throw new NotFoundException('Recipient not found')
        const entity = this.notifRepo.create({ title: data.title, message: data.message, type: data.type })
        entity.recipient = recipient
        const saved = await this.notifRepo.save(entity)
        return this.findOne(saved.id)
    }

    async markRead(id: string) {
        const n = await this.findOne(id)
        n.isRead = true
        await this.notifRepo.save(n)
        return n
    }

    async remove(id: string) {
        const n = await this.findOne(id)
        await this.notifRepo.remove(n)
        return { deleted: true }
    }
}
