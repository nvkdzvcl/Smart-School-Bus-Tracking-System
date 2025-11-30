import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './user.entity'
import { UserRole } from '../common/enums'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    async findDrivers() {
        return (await this.repo.find({ where: { role: UserRole.DRIVER } })).map(u => this.stripPassword(u))
    }

    async findAllUsers() {
        const all = await this.repo.find()
        return all.map(u => this.stripPassword(u))
    }

    async findAllSimple() {
        return this.repo.find({ select: ['id', 'fullName', 'role', 'phone'] })
    }

    async createDriver(dto: CreateDriverDto) {
        const existing = await this.repo.findOne({ where: { phone: dto.phone } })
        if (existing) throw new BadRequestException('Số điện thoại đã tồn tại')

        const passwordHash = await bcrypt.hash(dto.password, 10)

        const driver = this.repo.create({
            phone: dto.phone,
            fullName: dto.fullName,
            email: dto.email,

            licenseNumber: dto.licenseNumber,
            licenseClass: dto.licenseClass,

            // --- SỬA 1: Đổi null thành undefined ---
            licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,

            passwordHash,
            role: UserRole.DRIVER,

            // --- SỬA 2: Bỏ 'as any', nhưng bạn CẦN cập nhật file DTO (xem lưu ý dưới) ---
            status: (dto.status as any) || 'active'
        })

        const saved = await this.repo.save(driver)
        return this.stripPassword(saved)
    }

    async updateDriver(id: string, dto: UpdateDriverDto) {
        const driver = await this.repo.findOne({ where: { id, role: UserRole.DRIVER } })
        if (!driver) throw new NotFoundException('Không tìm thấy tài xế')

        if (dto.fullName !== undefined) driver.fullName = dto.fullName
        if (dto.phone !== undefined) driver.phone = dto.phone
        if (dto.email !== undefined) driver.email = dto.email

        if (dto.licenseNumber !== undefined) driver.licenseNumber = dto.licenseNumber
        if (dto.licenseClass !== undefined) driver.licenseClass = dto.licenseClass

        // Đoạn này bạn viết đúng rồi (undefined), giữ nguyên
        if (dto.licenseExpiry !== undefined) {
            driver.licenseExpiry = dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined
        }

        if (dto.status !== undefined) driver.status = dto.status as any

        if (dto.password) driver.passwordHash = await bcrypt.hash(dto.password, 10)

        const saved = await this.repo.save(driver)
        return this.stripPassword(saved)
    }

    async removeDriver(id: string) {
        const driver = await this.repo.findOne({ where: { id, role: UserRole.DRIVER } })
        if (!driver) throw new NotFoundException('Không tìm thấy tài xế')
        await this.repo.remove(driver)
        return { deleted: true }
    }

    private stripPassword(u: User) {
        const { passwordHash, ...rest } = u
        return rest
    }
}