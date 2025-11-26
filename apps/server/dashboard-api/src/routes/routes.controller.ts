import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common'
import { RoutesService } from './routes.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'

@Controller('routes')
export class RoutesController {
  constructor(private readonly service: RoutesService) { }

  // Public read endpoints
  @Get()
  findAll() { return this.service.findAll() }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id) }

  // Protected write endpoints - manager only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post()
  create(@Body() dto: CreateRouteDto) { return this.service.create(dto) }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) { return this.service.update(id, dto) }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id) }
}
