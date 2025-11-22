import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('drivers')
export class DriversController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() { return this.users.findDrivers() }

  @Post()
  create(@Body() dto: CreateDriverDto) { return this.users.createDriver(dto) }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) { return this.users.updateDriver(id, dto) }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.users.removeDriver(id) }
}
