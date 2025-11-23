import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

import { User } from '../user/user.entity'
import { UserRole } from '../common/enums'
import { LoginDto } from './dto/login.dto'
import { RegisterDriverDto } from './dto/register-driver.dto'

type JwtPayload = { sub: string; phone: string; name: string; role: UserRole; iat?: number; exp?: number }

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }
    async validateUser(phone: string, pass: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { phone } })
        if (!user) throw new UnauthorizedException('Số điện thoại không tồn tại')
        const isMatch = await bcrypt.compare(pass, user.passwordHash)
        if (!isMatch) throw new UnauthorizedException('Sai mật khẩu')
        // CHỈ CHO PHÉP MANAGER ĐĂNG NHẬP DASHBOARD
        if (user.role !== UserRole.MANAGER) {
            throw new UnauthorizedException('Tài khoản không có quyền truy cập Dashboard')
        }
        return user
    }
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.phone, loginDto.password)
        const payload: JwtPayload = { sub: user.id, phone: user.phone, name: user.fullName, role: user.role }
        return {
            access_token: this.jwtService.sign(payload),
            message: 'Đăng nhập thành công',
            user: { id: user.id, name: user.fullName, phone: user.phone, email: user.email, role: user.role },
        }
    }
    async registerDriver(dto: RegisterDriverDto) {
        const existingUser = await this.userRepository.findOne({ where: [{ phone: dto.phone }, { email: dto.email }] })
        if (existingUser) throw new ConflictException('Số điện thoại hoặc email đã được đăng ký')
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(dto.password, salt)
        const newDriver = this.userRepository.create({
            phone: dto.phone,
            fullName: dto.fullName,
            email: dto.email,
            passwordHash: hashedPassword,
            role: UserRole.DRIVER,
        })
        await this.userRepository.save(newDriver)
        return { message: 'Tạo tài khoản tài xế thành công', phone: newDriver.phone, fullName: newDriver.fullName, email: newDriver.email }
    }
    async verifyToken(token: string): Promise<JwtPayload> {
        const payload = (await this.jwtService.verifyAsync(token)) as JwtPayload
        return payload
    }
}
