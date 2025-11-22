import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common'
import { BusesService } from './buses.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateBusDto } from './dto/create-bus.dto'
import { UpdateBusDto } from './dto/update-bus.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('buses')
export class BusesController {
    constructor(private readonly service: BusesService) { }

    @Get()
    findAll() { return this.service.findAll() }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.service.findOne(id) }

    @Post()
    create(@Body() dto: CreateBusDto) { return this.service.create(dto) }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBusDto) { return this.service.update(id, dto) }

    @Delete(':id')
    remove(@Param('id') id: string) { return this.service.remove(id) }
}
