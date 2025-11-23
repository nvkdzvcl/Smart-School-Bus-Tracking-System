import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('students')
export class StudentsController {
    constructor(private readonly students: StudentsService) { }

    @Get()
    findAll() { return this.students.findAll() }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.students.findOne(id) }

    @Post()
    create(@Body() dto: CreateStudentDto) { return this.students.create(dto) }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateStudentDto) { return this.students.update(id, dto) }

    @Delete(':id')
    remove(@Param('id') id: string) { return this.students.remove(id) }
}
