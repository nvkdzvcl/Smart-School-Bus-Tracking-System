import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) { }

  // List all users (for FE filtering role=parent)
  @Get()
  findAll() { return this.users.findAllUsers() }

  // Create parent
  @Post()
  createParent(@Body() body: { fullName: string; phone: string; email?: string; address?: string; status?: 'active' | 'inactive' }) {
    return this.users.createParent(body)
  }

  // Update parent
  @Patch(':id')
  updateParent(
    @Param('id') id: string,
    @Body() body: { fullName?: string; phone?: string; email?: string; address?: string; status?: 'active' | 'inactive' }
  ) {
    return this.users.updateParent(id, body)
  }

  // Delete parent
  @Delete(':id')
  removeParent(@Param('id') id: string) {
    return this.users.deleteParent(id)
  }
}
