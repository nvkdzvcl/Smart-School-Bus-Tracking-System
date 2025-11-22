import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateNotificationDto } from './dto/create-notification.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) { }

    @Get() findAll() { return this.service.findAll() }
    @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
    @Post() create(@Body() dto: CreateNotificationDto) { return this.service.create(dto) }
    @Patch(':id/read') markRead(@Param('id') id: string) { return this.service.markRead(id) }
    @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
