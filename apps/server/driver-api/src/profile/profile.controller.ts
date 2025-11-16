import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

@Get('chat-contacts')
  async getChatContacts(@Req() req: any) {
    const driverId = req.user.userId;
    return this.profileService.getChatContacts(driverId);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.userId; // từ JwtStrategy: { userId, phone, name, role }
    return this.profileService.getProfile(userId);
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId;
    return this.profileService.updateProfile(userId, dto);
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user.userId;
    return this.profileService.changePassword(userId, dto);
  }
}
