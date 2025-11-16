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
import { UserRole } from '../user/user.roles.enum';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // -----------------------------------------------------------------
  // HÀM ĐÃ ĐƯỢC SỬA LẠI
  // -----------------------------------------------------------------
  async getChatContacts(driverId: string) {
    // Hàm phụ để tạo subquery đếm tin nhắn chưa đọc
    const unreadCountSubQuery = (subQuery) => {
      return subQuery
        .select('COUNT(msg.id)', 'count')
        .from('Messages', 'msg') // Tên bảng Messages của bạn
        .where('msg.sender_id = user.id') // Tin nhắn GỬI TỪ 'user' (quản lý/phụ huynh)
        .andWhere('msg.recipient_id = :driverId') // GỬI ĐẾN tài xế (driverId)
        .andWhere('msg.is_read = false');
    };

const lastMessageTimeSubQuery = (subQuery) => {
      return subQuery
        .select('MAX(lm.created_at)')
        .from('Messages', 'lm')
        .where(
          '(lm.sender_id = user.id AND lm.recipient_id = :driverId)',
        )
        .orWhere(
          '(lm.recipient_id = user.id AND lm.sender_id = :driverId)',
        );
    };

    // 1. Lấy tất cả Quản lý (đổi sang QueryBuilder)
    const managers = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.role', 'role')
      // Thêm cột unreadCount
      .addSelect(unreadCountSubQuery, 'unreadCount')
    .addSelect(lastMessageTimeSubQuery, 'lastMessageTimestamp')
      .where('user.role = :role', { role: UserRole.MANAGER })
      .setParameter('driverId', driverId) // Cung cấp driverId cho subquery
      .getRawMany();

    // 2. Lấy tất cả Phụ huynh
    const parents = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.role', 'role')
      // Thêm cột unreadCount
      .addSelect(unreadCountSubQuery, 'unreadCount')
        .addSelect(lastMessageTimeSubQuery, 'lastMessageTimestamp')
      .distinct(true)
      .innerJoin('Students', 's', 's.parent_id = user.id')
      .innerJoin('Trip_Students', 'ts', 'ts.student_id = s.id')
      .innerJoin('Trips', 't', 'ts.trip_id = t.id')
      .where('user.role = :role', { role: UserRole.PARENT })
      .andWhere('t.driver_id = :driverId', { driverId })
      .andWhere('t.trip_date = CURRENT_DATE')
      .andWhere("t.status IN ('scheduled', 'in_progress')")
      .getRawMany();

    // 3. Gộp 2 danh sách
    // Dùng Map để đảm bảo không trùng lặp
    const allContactsMap = new Map<string, any>();

    // Hàm xử lý data từ .getRawMany()
    const processContact = (contact: any) => {
      // getRawMany trả về unreadCount là string, cần chuyển sang number
      const processedContact = {
        id: contact.id,
        fullName: contact.fullName,
        role: contact.role,
        unreadCount: parseInt(contact.unreadCount, 10) || 0,
        lastMessageTimestamp: contact.lastMessageTimestamp,
      };
      allContactsMap.set(processedContact.id, processedContact);
    };

    managers.forEach(processContact);
    parents.forEach(processContact);

    // Xóa chính tài xế khỏi danh sách
    allContactsMap.delete(driverId);

    return Array.from(allContactsMap.values());
  }

  // -----------------------------------------------------------------
  // CÁC HÀM KHÁC GIỮ NGUYÊN
  // -----------------------------------------------------------------

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