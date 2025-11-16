// apps/driver-api/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../user/user.roles.enum'; // Import Enum

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // --- SỬA LẠI ĐỊNH NGHĨA PAYLOAD ---
  validate(payload: {
    sub: string; // <-- Đây là UUID (string)
    phone: string;
    name: string;
    role: UserRole;
  }) {
    // Chỉ trả về những gì cần thiết cho "Bảo vệ"
    return {
      userId: payload.sub, // Đổi tên thành userId
      phone: payload.phone,
      name: payload.name,
      role: payload.role,
    };
  }
}