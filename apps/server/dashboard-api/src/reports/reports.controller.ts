import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateReportDto } from './dto/create-report.dto'
import { UpdateReportDto } from './dto/update-report.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post() create(@Body() dto: CreateReportDto) { return this.service.create(dto) }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateReportDto) { return this.service.update(id, dto) }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
