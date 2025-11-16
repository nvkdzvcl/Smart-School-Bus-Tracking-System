// apps/driver-api/src/auth/dto/register-driver.dto.ts
import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class RegisterDriverDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // <-- SỬA TỪ "username" THÀNH "phone"

  @IsString()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;

  @IsEmail()
  email: string; 

  @IsString()
  @IsNotEmpty()
  fullName: string; // <-- SỬA TỪ "hoten" THÀNH "fullName"
}