import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateParentDto {
  @IsOptional() // Cho phép không gửi trường này (vì là update)
  @IsString() // Bắt buộc phải là chuỗi
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail() // Kiểm tra đúng định dạng email
  email?: string;
}
