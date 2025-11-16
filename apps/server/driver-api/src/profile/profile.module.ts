import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule, // để dùng được JwtAuthGuard, JwtStrategy
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
