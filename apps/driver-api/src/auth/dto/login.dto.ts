// apps/driver-api/src/auth/dto/login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // <-- SỬA TỪ "username" THÀNH "phone"

  @IsString()
  @IsNotEmpty()
  password: string;
}