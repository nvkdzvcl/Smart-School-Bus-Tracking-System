import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Report } from './report.entity'
import { User } from '../user/user.entity'
import { Trip } from '../trips/trip.entity'
import { Student } from '../students/student.entity'
import { ReportType, ReportStatus } from '../common/enums'

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report) private reportRepo: Repository<Report>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Trip) private tripRepo: Repository<Trip>,
        @InjectRepository(Student) private studentRepo: Repository<Student>,
    ) { }

    findAll() { return this.reportRepo.find({ relations: ['sender', 'trip', 'student'] }) }

    async findOne(id: string) {
        const r = await this.reportRepo.findOne({ where: { id }, relations: ['sender', 'trip', 'student'] })
        if (!r) throw new NotFoundException('Report not found')
        return r
    }

    async create(data: { senderId?: string; tripId?: string; studentId?: string; title: string; content: string; type: ReportType; imageUrl?: string }) {
        const entity = this.reportRepo.create({ title: data.title, content: data.content, type: data.type, imageUrl: data.imageUrl })
        if (data.senderId) {
            const sender = await this.userRepo.findOne({ where: { id: data.senderId } })
            if (!sender) throw new NotFoundException('Sender not found')
            entity.sender = sender
        }
        if (data.tripId) {
            const trip = await this.tripRepo.findOne({ where: { id: data.tripId } })
            if (!trip) throw new NotFoundException('Trip not found')
            entity.trip = trip
        }
        if (data.studentId) {
            const student = await this.studentRepo.findOne({ where: { id: data.studentId } })
            if (!student) throw new NotFoundException('Student not found')
            entity.student = student
        }
        const saved = await this.reportRepo.save(entity)
        return this.findOne(saved.id)
    }

    async update(id: string, data: { title?: string; content?: string; status?: ReportStatus }) {
        const r = await this.findOne(id)
        if (data.title !== undefined) r.title = data.title
        if (data.content !== undefined) r.content = data.content
        if (data.status !== undefined) r.status = data.status
        await this.reportRepo.save(r)
        return this.findOne(id)
    }

    async remove(id: string) {
        const r = await this.findOne(id)
        await this.reportRepo.remove(r)
        return { deleted: true }
    }
}
