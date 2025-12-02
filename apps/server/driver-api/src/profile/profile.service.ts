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
    // BƯỚC 1: Lấy danh sách Users (Quản lý + Phụ huynh có chuyến đi hôm nay)
    // Sử dụng UNION để gộp 2 nhóm người này lại
    const rawContacts = await this.userRepository.query(
      `
      -- 1. Lấy tất cả Quản lý
      SELECT u.id, u.full_name, u.role, u.phone
      FROM "Users" u
      WHERE u.role = 'manager'

      UNION

      -- 2. Lấy Phụ huynh có con đi chuyến xe của tài xế (chỉ tính hôm nay hoặc tương lai)
      SELECT DISTINCT u.id, u.full_name, u.role, u.phone
      FROM "Users" u
      INNER JOIN "Students" s ON s.parent_id = u.id
      INNER JOIN "Trip_Students" ts ON ts.student_id = s.id
      INNER JOIN "Trips" t ON t.id = ts.trip_id
      WHERE t.driver_id = $1
        AND t.trip_date >= CURRENT_DATE 
        AND t.status != 'cancelled'
      `,
      [driverId],
    );

    // BƯỚC 2: Lặp qua từng người để lấy thông tin hội thoại (Conversation)
    // (Làm cách này dễ debug hơn là viết 1 câu SQL khổng lồ)
    const result = await Promise.all(
      rawContacts.map(async (contact: any) => {
        // A. Tìm cuộc hội thoại giữa Tài xế và Người này
        const conversations = await this.userRepository.query(
          `
          SELECT id, last_message_at
          FROM "Conversations"
          WHERE (participant_1_id = $1 AND participant_2_id = $2)
             OR (participant_1_id = $2 AND participant_2_id = $1)
          LIMIT 1
          `,
          [driverId, contact.id],
        );

        let conversationId = null;
        let lastMessageTimestamp = null;
        let unreadCount = 0;

        if (conversations.length > 0) {
          conversationId = conversations[0].id;
          lastMessageTimestamp = conversations[0].last_message_at;

          // B. Đếm tin nhắn chưa đọc trong hội thoại này
          // (Người gửi là Contact, Người nhận là Driver, Chưa đọc)
          const unreadRes = await this.userRepository.query(
            `
            SELECT COUNT(*) as count
            FROM "Messages"
            WHERE conversation_id = $1
              AND sender_id = $2
              AND is_read = false
            `,
            [conversationId, contact.id],
          );
          unreadCount = parseInt(unreadRes[0].count, 10);
        }

        // C. Map dữ liệu trả về đúng chuẩn FE yêu cầu (ConversationState)
        return {
          id: contact.id,
          fullName: contact.full_name, // Lưu ý: SQL trả về snake_case
          role: contact.role,
          phone: contact.phone,
          conversationId: conversationId,
          unreadCount: unreadCount,
          lastMessageTimestamp: lastMessageTimestamp,
        };
      }),
    );

    // BƯỚC 3: Sắp xếp danh sách (Ai nhắn gần nhất thì đưa lên đầu)
    return result.sort((a, b) => {
      const timeA = a.lastMessageTimestamp
        ? new Date(a.lastMessageTimestamp).getTime()
        : 0;
      const timeB = b.lastMessageTimestamp
        ? new Date(b.lastMessageTimestamp).getTime()
        : 0;
      return timeB - timeA;
    });
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