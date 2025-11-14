// // apps/driver-api/src/auth/auth.module.ts
// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { PassportModule } from '@nestjs/passport';

// // Import Entity MỚI
// import { User } from '../user/user.entity';
// // BỎ import TaiKhoan và NguoiDung

// import { JwtStrategy } from './jwt.strategy';

// @Module({
//   imports: [
//     // Đăng ký Entity MỚI
//     TypeOrmModule.forFeature([User]),
//     // BỎ TypeOrmModule.forFeature([TaiKhoan, NguoiDung]),

//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.getOrThrow<string>('JWT_SECRET'),
//         signOptions: { expiresIn: '1d' },
//       }),
//     }),
//     ConfigModule,
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, JwtStrategy],
//   exports: [PassportModule],
// })
// export class AuthModule {}
// apps/driver-api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { User } from '../user/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  // Export để module khác có thể @UseGuards(JwtAuthGuard) và dùng JwtModule nếu cần
  exports: [PassportModule, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
