// apps/driver-api/src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDriverDto } from './dto/register-driver.dto'; // <-- 1. THÊM IMPORT NÀY

@Controller('auth') // Đường dẫn sẽ là /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login') // API: POST /auth/login
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // --- 2. THÊM NGUYÊN CỤM NÀY VÀO ---
  @Post('register-driver') // API: POST /auth/register-driver
  register(@Body() registerDto: RegisterDriverDto) {
    return this.authService.registerDriver(registerDto);
  }
  // ---------------------------------
}