import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, Equal } from 'typeorm' // Thêm Not và Equal từ typeorm để kiểm tra trùng lặp khi update
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
        if (!dto.tripDate || !dto.session || !dto.type) {
            throw new BadRequestException('Vui lòng cung cấp đầy đủ Ngày, Buổi và Loại chuyến đi.');
        }

        // 1. Kiểm tra Trùng lặp Tài xế (driver_id, trip_date, session, type)
        if (dto.driverId) {
            const driverConflict = await this.tripRepo.findOne({
                where: {
                    driver: { id: dto.driverId },
                    tripDate: dto.tripDate,
                    session: dto.session,
                    type: dto.type,
                },
                relations: ['route', 'bus', 'driver'],
            });

            if (driverConflict) {
                const routeName = driverConflict.route ? driverConflict.route['name'] : 'N/A';
                const busLicense = driverConflict.bus ? driverConflict.bus['licensePlate'] : 'N/A';
                const driverName = driverConflict.driver ? driverConflict.driver['fullName'] : 'N/A';

                throw new BadRequestException(
                    `Lỗi: Tài xế ${driverName} đã có lịch trình trùng.\n` +
                    `Trùng Lịch: Ngày ${dto.tripDate}, Buổi ${dto.session}, Loại ${dto.type}.\n` +
                    `Chuyến trùng: Tuyến ${routeName}, Xe ${busLicense}.`
                );
            }
        }

        // 2. Kiểm tra Trùng lặp Xe buýt (bus_id, trip_date, session, type)
        if (dto.busId) {
            const busConflict = await this.tripRepo.findOne({
                where: {
                    bus: { id: dto.busId },
                    tripDate: dto.tripDate,
                    session: dto.session,
                    type: dto.type,
                },
                relations: ['route', 'bus', 'driver'],
            });

            if (busConflict) {
                const routeName = busConflict.route ? busConflict.route['name'] : 'N/A';
                const busLicense = busConflict.bus ? busConflict.bus['licensePlate'] : 'N/A';
                const driverName = busConflict.driver ? busConflict.driver['fullName'] : 'N/A';

                throw new BadRequestException(
                    `Lỗi: Xe buýt ${busLicense} đã được phân công trùng lịch.\n` +
                    `Trùng Lịch: Ngày ${dto.tripDate}, Buổi ${dto.session}, Loại ${dto.type}.\n` +
                    `Chuyến trùng: Tuyến ${routeName}, Tài xế ${driverName}.`
                );
            }
        }

        // --- Bắt đầu tạo Trip nếu không có xung đột ---

        const trip = this.tripRepo.create({ tripDate: dto.tripDate, session: dto.session, type: dto.type })
        if (dto.plannedStartTime) trip.plannedStartTime = new Date(dto.plannedStartTime)

        if (dto.routeId) {
            const route = await this.routeRepo.findOne({ where: { id: dto.routeId } }); if (!route) throw new NotFoundException('Không tìm thấy Tuyến đường.'); trip.route = route!
        }
        if (dto.busId) {
            const bus = await this.busRepo.findOne({ where: { id: dto.busId } }); if (!bus) throw new NotFoundException('Không tìm thấy Xe buýt.'); trip.bus = bus!
        }
        if (dto.driverId) {
            const driver = await this.userRepo.findOne({ where: { id: dto.driverId } }); if (!driver) throw new NotFoundException('Không tìm thấy Tài xế.'); trip.driver = driver!
        }

        const saved = await this.tripRepo.save(trip)

        // Thêm học sinh vào chuyến đi
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
        const trip = await this.tripRepo.findOne({ where: { id }, relations: ['driver', 'bus'] })
        if (!trip) throw new NotFoundException('Trip not found')

        // Sử dụng giá trị cũ nếu DTO không cung cấp, hoặc giá trị mới nếu DTO cung cấp
        const newDriverId = dto.driverId || trip.driver?.id;
        const newBusId = dto.busId || trip.bus?.id;
        const newTripDate = dto.tripDate || trip.tripDate;
        const newSession = dto.session || trip.session;
        const newType = dto.type || trip.type;


        // 1. Kiểm tra Trùng lặp Tài xế khi Cập nhật (driver_id, trip_date, session, type)
        if (newDriverId) {
            const driverConflict = await this.tripRepo.findOne({
                where: {
                    id: Not(Equal(id)), // KHÔNG bao gồm chuyến đi hiện tại
                    driver: { id: newDriverId },
                    tripDate: newTripDate,
                    session: newSession,
                    type: newType,
                },
                relations: ['route', 'bus', 'driver'],
            });

            if (driverConflict) {
                const routeName = driverConflict.route ? driverConflict.route['name'] : 'N/A';
                const busLicense = driverConflict.bus ? driverConflict.bus['licensePlate'] : 'N/A';
                const driverName = driverConflict.driver ? driverConflict.driver['fullName'] : 'N/A';

                throw new BadRequestException(
                    `Lỗi: Tài xế ${driverName} đã có lịch trình trùng sau khi cập nhật.` +
                    `Trùng Lịch: Ngày ${newTripDate}, Buổi ${newSession}, Loại ${newType}.` +
                    `Chuyến trùng: Tuyến ${routeName}, Xe ${busLicense}.`
                );
            }
        }

        // 2. Kiểm tra Trùng lặp Xe buýt khi Cập nhật (bus_id, trip_date, session, type)
        if (newBusId) {
            const busConflict = await this.tripRepo.findOne({
                where: {
                    id: Not(Equal(id)), // KHÔNG bao gồm chuyến đi hiện tại
                    bus: { id: newBusId },
                    tripDate: newTripDate,
                    session: newSession,
                    type: newType,
                },
                relations: ['route', 'bus', 'driver'],
            });

            if (busConflict) {
                const routeName = busConflict.route ? busConflict.route['name'] : 'N/A';
                const busLicense = busConflict.bus ? busConflict.bus['licensePlate'] : 'N/A';
                const driverName = busConflict.driver ? busConflict.driver['fullName'] : 'N/A';

                throw new BadRequestException(
                    `Lỗi: Xe buýt ${busLicense} đã được phân công trùng lịch sau khi cập nhật.` +
                    `Trùng Lịch: Ngày ${newTripDate}, Buổi ${newSession}, Loại ${newType}.` +
                    `Chuyến trùng: Tuyến ${routeName}, Tài xế ${driverName}.`
                );
            }
        }

        // --- Áp dụng các giá trị mới ---

        if (dto.routeId) {
            const route = await this.routeRepo.findOne({ where: { id: dto.routeId } }); if (!route) throw new NotFoundException('Route not found'); trip.route = route!
        }
        // Cập nhật driver/bus chỉ khi chúng không bị trùng lịch
        if (dto.busId) {
            const bus = await this.busRepo.findOne({ where: { id: dto.busId } }); if (!bus) throw new NotFoundException('Bus not found'); trip.bus = bus!
        }
        if (dto.driverId) {
            const driver = await this.userRepo.findOne({ where: { id: dto.driverId } }); if (!driver) throw new NotFoundException('Driver not found'); trip.driver = driver!
        }
        if (dto.tripDate) trip.tripDate = dto.tripDate;
        if (dto.session) trip.session = dto.session;
        if (dto.type) trip.type = dto.type;
        if (dto.plannedStartTime) trip.plannedStartTime = new Date(dto.plannedStartTime);

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

    async recentAlerts() {
        const trips = await this.tripRepo.find({
            relations: ['bus', 'route', 'route.stops', 'route.stops.stop', 'students', 'students.student']
        })
        const alerts: { time: string; type: string; message: string; licensePlate?: string }[] = []
        const now = new Date()
        for (const trip of trips) {
            const license = trip.bus?.licensePlate || 'N/A'
            // Delay alerts
            if (trip.plannedStartTime) {
                if (trip.actualStartTime) {
                    const delayMs = trip.actualStartTime.getTime() - trip.plannedStartTime.getTime()
                    if (delayMs > 0 && delayMs < 1000 * 60 * 180) { // dưới 3h
                        const mins = Math.round(delayMs / 60000)
                        alerts.push({
                            time: trip.actualStartTime.toISOString(),
                            type: 'delay',
                            message: `Xe ${license} bắt đầu chậm ${mins} phút so với lịch trình`,
                            licensePlate: license
                        })
                    }
                } else if (trip.status === TripStatus.SCHEDULED && now > trip.plannedStartTime) {
                    const delayMs = now.getTime() - trip.plannedStartTime.getTime()
                    const mins = Math.round(delayMs / 60000)
                    alerts.push({
                        time: now.toISOString(),
                        type: 'delay',
                        message: `Xe ${license} đang chậm ${mins} phút (chưa khởi hành)`,
                        licensePlate: license
                    })
                }
            }
            // Pickup / Dropoff stop completion alerts
            if (trip.route?.stops?.length && trip.students?.length) {
                const stopMap: Record<string, { pickupTotal: number; pickupAttended: number; dropTotal: number; dropAttended: number; lastPickup?: Date; lastDrop?: Date }> = {}
                for (const rs of trip.route.stops as any[]) {
                    const sid = rs.stop?.id || rs.stopId
                    if (!sid) continue
                    stopMap[sid] = { pickupTotal: 0, pickupAttended: 0, dropTotal: 0, dropAttended: 0 }
                }
                for (const ts of trip.students) {
                    const stud = ts.student
                    if (!stud) continue
                    const pickupId = (stud as any).pickupStop?.id || (stud as any).pickupStopId
                    const dropId = (stud as any).dropoffStop?.id || (stud as any).dropoffStopId
                    if (pickupId && stopMap[pickupId]) {
                        stopMap[pickupId].pickupTotal++
                        if (ts.status === AttendanceStatus.ATTENDED) {
                            stopMap[pickupId].pickupAttended++
                            if (ts.attendedAt) stopMap[pickupId].lastPickup = ts.attendedAt
                        }
                    }
                    if (dropId && stopMap[dropId]) {
                        stopMap[dropId].dropTotal++
                        if (ts.status === AttendanceStatus.ATTENDED) {
                            stopMap[dropId].dropAttended++
                            if (ts.attendedAt) stopMap[dropId].lastDrop = ts.attendedAt
                        }
                    }
                }
                for (const rs of trip.route.stops as any[]) {
                    const sid = rs.stop?.id || rs.stopId
                    const name = rs.stop?.name || rs.name || 'Điểm dừng'
                    const agg = stopMap[sid]
                    if (!agg) continue
                    // Pickup completion
                    if (trip.type === 'pickup' && agg.pickupTotal > 0 && agg.pickupAttended === agg.pickupTotal && agg.lastPickup) {
                        alerts.push({
                            time: agg.lastPickup.toISOString(),
                            type: 'pickup_complete',
                            message: `Xe ${license} đã đón xong học sinh tại ${name}`,
                            licensePlate: license
                        })
                    }
                    // Dropoff completion
                    if (trip.type === 'dropoff' && agg.dropTotal > 0 && agg.dropAttended === agg.dropTotal && agg.lastDrop) {
                        alerts.push({
                            time: agg.lastDrop.toISOString(),
                            type: 'dropoff_complete',
                            message: `Xe ${license} đã trả xong học sinh tại ${name}`,
                            licensePlate: license
                        })
                    }
                }
            }
            // Trip completion
            if (trip.status === TripStatus.COMPLETED && trip.actualEndTime) {
                alerts.push({
                    time: trip.actualEndTime.toISOString(),
                    type: 'trip_complete',
                    message: `Xe ${license} đã hoàn thành chuyến đi ${trip.session === 'morning' ? 'sáng' : 'chiều'}`,
                    licensePlate: license
                })
            }
        }
        // Sắp xếp mới nhất trước và giới hạn 50
        alerts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        return alerts.slice(0, 50)
    }
}