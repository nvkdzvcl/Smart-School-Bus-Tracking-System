import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Trip } from './trip.entity'
import { TripStudent } from './trip-student.entity'
import { Route } from '../routes/route.entity'
import { Bus } from '../buses/bus.entity'
import { User } from '../user/user.entity'
import { Student } from '../students/student.entity'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { AttendanceStatus, TripStatus } from '../common/enums'

@Injectable()
export class TripsService {
    constructor(
        @InjectRepository(Trip) private tripRepo: Repository<Trip>,
        @InjectRepository(TripStudent) private tsRepo: Repository<TripStudent>,
        @InjectRepository(Route) private routeRepo: Repository<Route>,
        @InjectRepository(Bus) private busRepo: Repository<Bus>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Student) private studentRepo: Repository<Student>,
    ) { }

    findAll() { return this.tripRepo.find({ relations: ['route', 'bus', 'driver', 'students', 'students.student'] }) }

    async findOne(id: string) {
        const t = await this.tripRepo.find({ where: { id }, relations: ['route', 'bus', 'driver', 'students', 'students.student'] })
        if (!t.length) throw new NotFoundException('Trip not found')
        return t[0]
    }

    async create(dto: CreateTripDto) {
        if (!dto.tripDate || !dto.session || !dto.type) throw new BadRequestException('Missing required fields')
        const trip = this.tripRepo.create({ tripDate: dto.tripDate, session: dto.session, type: dto.type })
        if (dto.routeId) {
            const route = await this.routeRepo.findOne({ where: { id: dto.routeId } }); if (!route) throw new NotFoundException('Route not found'); trip.route = route!
        }
        if (dto.busId) {
            const bus = await this.busRepo.findOne({ where: { id: dto.busId } }); if (!bus) throw new NotFoundException('Bus not found'); trip.bus = bus!
        }
        if (dto.driverId) {
            const driver = await this.userRepo.findOne({ where: { id: dto.driverId } }); if (!driver) throw new NotFoundException('Driver not found'); trip.driver = driver!
        }
        const saved = await this.tripRepo.save(trip)
        if (dto.studentIds?.length) {
            for (const sid of dto.studentIds) {
                const stud = await this.studentRepo.findOne({ where: { id: sid } })
                if (!stud) continue
                await this.tsRepo.save({ tripId: saved.id, studentId: sid, status: AttendanceStatus.PENDING })
            }
        }
        return this.findOne(saved.id)
    }

    async update(id: string, dto: UpdateTripDto) {
        const trip = await this.tripRepo.findOne({ where: { id } })
        if (!trip) throw new NotFoundException('Trip not found')
        if (dto.routeId) {
            const route = await this.routeRepo.findOne({ where: { id: dto.routeId } }); if (!route) throw new NotFoundException('Route not found'); trip.route = route!
        }
        if (dto.busId) {
            const bus = await this.busRepo.findOne({ where: { id: dto.busId } }); if (!bus) throw new NotFoundException('Bus not found'); trip.bus = bus!
        }
        if (dto.driverId) {
            const driver = await this.userRepo.findOne({ where: { id: dto.driverId } }); if (!driver) throw new NotFoundException('Driver not found'); trip.driver = driver!
        }
        if (dto.status) trip.status = dto.status as TripStatus
        if (dto.actualStartTime) trip.actualStartTime = new Date(dto.actualStartTime)
        if (dto.actualEndTime) trip.actualEndTime = new Date(dto.actualEndTime)
        await this.tripRepo.save(trip)
        return this.findOne(id)
    }

    async addStudents(id: string, studentIds: string[]) {
        await this.findOne(id)
        for (const sid of studentIds) {
            const exists = await this.tsRepo.findOne({ where: { tripId: id, studentId: sid } })
            if (!exists) await this.tsRepo.save({ tripId: id, studentId: sid, status: AttendanceStatus.PENDING })
        }
        return this.findOne(id)
    }

    async updateAttendance(id: string, studentId: string, status: AttendanceStatus) {
        const ts = await this.tsRepo.findOne({ where: { tripId: id, studentId } })
        if (!ts) throw new NotFoundException('Trip student not found')
        ts.status = status
        if (status === AttendanceStatus.ATTENDED) ts.attendedAt = new Date()
        await this.tsRepo.save(ts)
        return ts
    }

    async remove(id: string) {
        const trip = await this.tripRepo.findOne({ where: { id } })
        if (!trip) throw new NotFoundException('Trip not found')
        await this.tripRepo.remove(trip)
        return { deleted: true }
    }
}
