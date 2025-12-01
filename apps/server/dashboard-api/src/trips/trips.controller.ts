import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common'
import { TripsService } from './trips.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { AddStudentsDto } from './dto/add-students.dto'
import { UpdateAttendanceDto } from './dto/update-attendance.dto'

@Controller('trips')
export class TripsController {
    constructor(private readonly service: TripsService) { }

    // Public read endpoints (place static paths before dynamic :id)
    @Get('alerts')
    recentAlerts() { return this.service.recentAlerts() }

    @Get()
    findAll() {
        try {
            return this.service.findAll()
        } catch (e: any) {
            throw new HttpException(e.message || 'Failed to load trips', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        try {
            return this.service.findOne(id)
        } catch (e: any) {
            throw new HttpException(e.message || 'Failed to load trip', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // Protected write endpoints - manager only
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('manager')
    @Post()
    async create(@Body() dto: CreateTripDto) {
        try {
            return await this.service.create(dto)
        } catch (e) {
            // Log the full error on the server for debugging
            console.error('Error creating trip:', e)
            // If the service threw an HttpException-like error, preserve status/message
            const status = (e && e.status) || HttpStatus.INTERNAL_SERVER_ERROR
            const message = (e && e.message) || 'Internal server error'
            throw new HttpException(message, status)
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('manager')
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTripDto) { return this.service.update(id, dto) }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('manager')
    @Post(':id/students')
    addStudents(@Param('id') id: string, @Body() body: AddStudentsDto) {
        return this.service.addStudents(id, body.studentIds)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('manager')
    @Patch(':id/attendance/:studentId')
    attendance(
        @Param('id') id: string,
        @Param('studentId') studentId: string,
        @Body() body: UpdateAttendanceDto
    ) { return this.service.updateAttendance(id, studentId, body.status) }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('manager')
    @Delete(':id')
    remove(@Param('id') id: string) { return this.service.remove(id) }
}
