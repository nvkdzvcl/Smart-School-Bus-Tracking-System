import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common'
import { TripsService } from './trips.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { AddStudentsDto } from './dto/add-students.dto'
import { UpdateAttendanceDto } from './dto/update-attendance.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('trips')
export class TripsController {
    constructor(private readonly service: TripsService) { }

    @Get() findAll() { return this.service.findAll() }
    @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }

    @Post() create(@Body() dto: CreateTripDto) { return this.service.create(dto) }

    @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTripDto) { return this.service.update(id, dto) }

    @Post(':id/students') addStudents(@Param('id') id: string, @Body() body: AddStudentsDto) {
        return this.service.addStudents(id, body.studentIds)
    }

    @Patch(':id/attendance/:studentId') attendance(
        @Param('id') id: string,
        @Param('studentId') studentId: string,
        @Body() body: UpdateAttendanceDto
    ) { return this.service.updateAttendance(id, studentId, body.status) }

    @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
