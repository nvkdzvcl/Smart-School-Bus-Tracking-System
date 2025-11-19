import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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
}
