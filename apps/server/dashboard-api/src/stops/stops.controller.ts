import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common'
import { StopsService } from './stops.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateStopDto } from './dto/create-stop.dto'
import { UpdateStopDto } from './dto/update-stop.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('stops')
export class StopsController {
    constructor(private readonly service: StopsService) { }
    @Get() findAll() { return this.service.findAll() }
    @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
    @Post() create(@Body() dto: CreateStopDto) { return this.service.create(dto) }
    @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateStopDto) { return this.service.update(id, dto) }
    @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
