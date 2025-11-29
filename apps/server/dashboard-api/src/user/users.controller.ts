import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) { }

  // Public read endpoint
  @Get()
  findAll() { return this.users.findAllUsers() }
}
