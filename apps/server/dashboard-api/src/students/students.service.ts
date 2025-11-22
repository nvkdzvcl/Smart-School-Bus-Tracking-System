import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Student } from './student.entity'
import { User } from '../user/user.entity'
import { Stop } from '../stops/stops.entity'
import { Route } from '../routes/route.entity'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student) private readonly studentsRepo: Repository<Student>,
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
        @InjectRepository(Stop) private readonly stopsRepo: Repository<Stop>,
        @InjectRepository(Route) private readonly routesRepo: Repository<Route>,
    ) { }

    async findAll() {
        const list = await this.studentsRepo.find({ relations: ['parent', 'route', 'pickupStop', 'dropoffStop'] })
        return list
    }

    async findOne(id: string) {
        const student = await this.studentsRepo.findOne({ where: { id }, relations: ['parent', 'route', 'pickupStop', 'dropoffStop'] })
        if (!student) throw new NotFoundException('Không tìm thấy học sinh')
        return student
    }

    async create(dto: CreateStudentDto) {
        const student = new Student()
        student.fullName = dto.fullName
        student.class = dto.class
        student.status = dto.status || 'active'

        if (dto.parentId) student.parent = await this.usersRepo.findOne({ where: { id: dto.parentId } }) || undefined
        if (dto.pickupStopId) student.pickupStop = await this.stopsRepo.findOne({ where: { id: dto.pickupStopId } }) || undefined
        if (dto.dropoffStopId) student.dropoffStop = await this.stopsRepo.findOne({ where: { id: dto.dropoffStopId } }) || undefined
        if (dto.routeId) student.route = await this.routesRepo.findOne({ where: { id: dto.routeId } }) || undefined

        const saved = await this.studentsRepo.save(student)
        return await this.studentsRepo.findOne({ where: { id: saved.id }, relations: ['parent', 'route', 'pickupStop', 'dropoffStop'] })
    }

    async update(id: string, dto: UpdateStudentDto) {
        const student = await this.studentsRepo.findOne({ where: { id }, relations: ['parent', 'route', 'pickupStop', 'dropoffStop'] })
        if (!student) throw new NotFoundException('Không tìm thấy học sinh')

        if (dto.fullName !== undefined) student.fullName = dto.fullName
        if (dto.class !== undefined) student.class = dto.class
        if (dto.status !== undefined) student.status = dto.status

        if (dto.parentId !== undefined) student.parent = dto.parentId ? (await this.usersRepo.findOne({ where: { id: dto.parentId } })) || undefined : undefined
        if (dto.pickupStopId !== undefined) student.pickupStop = dto.pickupStopId ? (await this.stopsRepo.findOne({ where: { id: dto.pickupStopId } })) || undefined : undefined
        if (dto.dropoffStopId !== undefined) student.dropoffStop = dto.dropoffStopId ? (await this.stopsRepo.findOne({ where: { id: dto.dropoffStopId } })) || undefined : undefined
        if (dto.routeId !== undefined) student.route = dto.routeId ? (await this.routesRepo.findOne({ where: { id: dto.routeId } })) || undefined : undefined

        await this.studentsRepo.save(student)
        return await this.studentsRepo.findOne({ where: { id: student.id }, relations: ['parent', 'route', 'pickupStop', 'dropoffStop'] })
    }

    async remove(id: string) {
        const student = await this.studentsRepo.findOne({ where: { id } })
        if (!student) throw new NotFoundException('Không tìm thấy học sinh')
        await this.studentsRepo.remove(student)
        return { deleted: true }
    }
}
