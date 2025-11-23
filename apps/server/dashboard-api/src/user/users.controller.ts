import { Controller, Get, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get()
  findAll() { return this.users.findAllUsers() }
}
