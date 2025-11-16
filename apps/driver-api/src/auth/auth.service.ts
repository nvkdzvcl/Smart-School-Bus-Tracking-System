// apps/driver-api/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../user/user.entity'; // <-- Entity MỚI
import { UserRole } from '../user/user.roles.enum'; // <-- Enum MỚI
import { LoginDto } from './dto/login.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';

@Injectable()
export class AuthService {
  constructor(
    // Bơm Repository MỚI
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // --- VIẾT LẠI HÀM VALIDATE ---
  async validateUser(phone: string, pass: string): Promise<User> {
    // 1. Tìm tài khoản bằng 'phone'
    const user = await this.userRepository.findOne({
      where: { phone: phone },
    });

    if (!user) {
      throw new UnauthorizedException('Số điện thoại không tồn tại');
    }

    // 2. Kiểm tra mật khẩu (so sánh với 'passwordHash')
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    // 3. (Quan trọng) Chỉ cho phép 'driver' đăng nhập
    if (user.role !== UserRole.DRIVER && user.role !== UserRole.MANAGER) {
      throw new UnauthorizedException('Tài khoản không phải là tài xế');
    }

    return user;
  }

  // --- VIẾT LẠI HÀM LOGIN ---
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.phone, loginDto.password);

    // Thông tin sẽ lưu trong Token
    const payload = {
      sub: user.id, // ID người dùng (UUID)
      phone: user.phone,
      name: user.fullName,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      message: 'Đăng nhập thành công',
      driver: {
        id: user.id,
        name: user.fullName,
        phone: user.phone,
        email: user.email,
      },
    };
  }

  // --- VIẾT LẠI HÀM REGISTER ---
  async registerDriver(dto: RegisterDriverDto) {  
    // 1. Check xem SĐT (phone) đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: [{ phone: dto.phone }, { email: dto.email }],
  });
    if (existingUser) {
      throw new ConflictException('Số điện thoại hoặc email đã được đăng ký');
    }

    // 2. Hash mật khẩu
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Tạo 'User' mới (Chỉ 1 bảng, không cần 2 bảng)
    const newDriver = this.userRepository.create({
      phone: dto.phone,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: hashedPassword, // Lưu vào cột 'password_hash'
      role: UserRole.DRIVER, // Gán cứng là tài xế
    });

    // 4. Lưu tài xế vào DB
    await this.userRepository.save(newDriver);

    return {
      message: 'Tạo tài khoản tài xế thành công',
      phone: newDriver.phone,
      fullName: newDriver.fullName,
      email: newDriver.email,
    };
  }

  // --- THÊM HÀM NÀY ĐỂ XÁC THỰC TOKEN ---
  async verifyToken(token: string): Promise<any> {
    try {
      // Dùng jwtService (đã được inject) để xác thực
      // Nó sẽ tự kiểm tra chữ ký và hạn (expired)
      const payload = await this.jwtService.verifyAsync(token);
      
      // Nếu bạn muốn cẩn thận hơn, kiểm tra xem user còn tồn tại không
      // const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      // if (!user) {
      //   throw new UnauthorizedException('User không còn tồn tại');
      // }
      
      return payload; // Trả về payload (chứa sub, phone, v.v.)
    } catch (e) {
      // Token hết hạn (expired) hoặc không hợp lệ
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}