import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator'

export class RegisterDriverDto {
    @IsString()
    @IsNotEmpty()
    phone: string

    @IsString()
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    password: string

    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    fullName: string
}
