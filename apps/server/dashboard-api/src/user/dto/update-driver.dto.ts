import { IsOptional, IsString, MinLength, IsEmail, IsIn, MaxLength, IsDateString } from 'class-validator'

export class UpdateDriverDto {
  @IsString() @IsOptional() fullName?: string
  @IsString() @IsOptional() phone?: string
  @IsEmail() @IsOptional() email?: string
  @IsString() @IsOptional() licenseNumber?: string

  // Mới: Cập nhật hạng bằng
  @IsString()
  @IsOptional()
  @MaxLength(50)
  licenseClass?: string

  // Mới: Cập nhật ngày hết hạn
  @IsDateString()
  @IsOptional()
  licenseExpiry?: string

  @IsString() @MinLength(6) @IsOptional() password?: string

  @IsOptional()
  @IsIn(['active', 'inactive', 'locked']) // Đồng bộ với entity mới
  status?: 'active' | 'inactive' | 'locked'
}