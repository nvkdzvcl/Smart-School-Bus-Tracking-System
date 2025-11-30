import { IsNotEmpty, IsString, MinLength, IsOptional, IsEmail, MaxLength, IsDateString } from 'class-validator'

export class CreateDriverDto {
  status?: string;
  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsNotEmpty()
  licenseNumber: string

  // Mới: Hạng bằng (giới hạn 50 ký tự)
  @IsString()
  @IsOptional()
  @MaxLength(50)
  licenseClass?: string

  // Mới: Ngày hết hạn (Chuỗi ngày dạng YYYY-MM-DD)
  @IsDateString()
  @IsOptional()
  licenseExpiry?: string

  @IsString()
  @MinLength(6)
  password: string
}