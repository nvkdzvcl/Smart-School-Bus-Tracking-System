import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common'
import { BusLocationsService } from './bus-locations.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { RecordLocationDto } from './dto/record-location.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
@Controller('bus-locations')
export class BusLocationsController {
    constructor(private readonly service: BusLocationsService) { }

    @Get(':tripId/latest') latest(@Param('tripId') tripId: string) { return this.service.latestForTrip(tripId) }

    @Get(':tripId/history') history(@Param('tripId') tripId: string, @Query('limit') limit?: string) {
        return this.service.historyForTrip(tripId, limit ? parseInt(limit, 10) : 100)
    }

    @Post(':tripId') record(
        @Param('tripId') tripId: string,
        @Body() body: RecordLocationDto
    ) {
        return this.service.recordLocation({ tripId, latitude: String(body.latitude), longitude: String(body.longitude) })
    }
}
