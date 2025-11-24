import { IsNotEmpty, IsString, MinLength, IsOptional, IsEmail } from 'class-validator'

export class CreateDriverDto {
  @IsString() @IsNotEmpty() fullName: string
  @IsString() @IsNotEmpty() phone: string
  @IsEmail() @IsOptional() email?: string
  @IsString() @IsNotEmpty() licenseNumber: string
  @IsString() @MinLength(6) password: string
}
