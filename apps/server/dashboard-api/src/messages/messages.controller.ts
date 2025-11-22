import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { SendMessageDto } from './dto/send-message.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('messages')
export class MessagesController {
    constructor(private readonly service: MessagesService) { }

    @Get() findAll() { return this.service.findAll() }
    @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
    @Post() send(@Body() dto: SendMessageDto) { return this.service.send(dto) }
    @Patch(':id/read') markRead(@Param('id') id: string) { return this.service.markRead(id) }
    @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
