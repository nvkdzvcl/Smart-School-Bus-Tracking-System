import { Injectable } from '@nestjs/common';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['students'],
    });
  }

  async updateParentInfo(id: string, parent: Partial<User>) {
    await this.userRepository.update(id, {
      fullName: parent.fullName,
      phone: parent.phone,
      email: parent.email,
    });
    // Trả về bản ghi đã cập nhật
    return await this.getById(id);
  }

  async searchUsers(keyword: string) {
    return await this.userRepository.find({
      where: [
        // Trường hợp 1: Đúng Role VÀ trùng Tên
        {
          role: In(['driver', 'manager']),
          fullName: ILike(`%${keyword}%`), // ILike để tìm không phân biệt hoa thường
        },
        // HOẶC (OR)
        // Trường hợp 2: Đúng Role VÀ trùng SĐT
        {
          role: In(['driver', 'manager']),
          phone: ILike(`%${keyword}%`),
        },
      ],
    });
  }
}
