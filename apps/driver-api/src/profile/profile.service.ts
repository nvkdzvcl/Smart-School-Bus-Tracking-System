import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../user/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // GET /profile/me
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // PATCH /profile/me
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    // Check trùng SĐT nếu có đổi
    if (dto.phone && dto.phone !== user.phone) {
      const existedPhone = await this.userRepository.findOne({
        where: { phone: dto.phone, id: Not(user.id) },
      });
      if (existedPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng.');
      }
    }

    // Check trùng email nếu có đổi
    if (dto.email && dto.email !== user.email) {
      const existedEmail = await this.userRepository.findOne({
        where: { email: dto.email, id: Not(user.id) },
      });
      if (existedEmail) {
        throw new ConflictException('Email đã được sử dụng.');
      }
    }

    // Apply thay đổi
    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }
    if (dto.email !== undefined) {
      user.email = dto.email;
    }

    const saved = await this.userRepository.save(user);

    return {
      message: 'Cập nhật thông tin thành công.',
      id: saved.id,
      fullName: saved.fullName,
      phone: saved.phone,
      email: saved.email,
    };
  }

  // PATCH /profile/change-password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }

    // Nếu mật khẩu mới giống mật khẩu cũ thì chặn
    const isSame = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
      );
    }

    const salt = await bcrypt.genSalt();
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    user.passwordHash = newHash;
    await this.userRepository.save(user);

    return {
      message: 'Đổi mật khẩu thành công.',
    };
  }
}
