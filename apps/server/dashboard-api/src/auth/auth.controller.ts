import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDriverDto } from './dto/register-driver.dto'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @Post('register-driver')
    register(@Body() registerDto: RegisterDriverDto) {
        return this.authService.registerDriver(registerDto)
    }
}
