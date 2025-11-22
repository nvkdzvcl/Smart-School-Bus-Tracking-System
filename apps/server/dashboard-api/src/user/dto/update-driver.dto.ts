import { IsOptional, IsString, MinLength, IsEmail } from 'class-validator'

export class UpdateDriverDto {
  @IsString() @IsOptional() fullName?: string
  @IsString() @IsOptional() phone?: string
  @IsEmail() @IsOptional() email?: string
  @IsString() @IsOptional() licenseNumber?: string
  @IsString() @MinLength(6) @IsOptional() password?: string
}
