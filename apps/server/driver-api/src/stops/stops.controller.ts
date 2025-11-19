import { Controller, Get, Param } from '@nestjs/common';
import { StopsService } from './stops.service';

@Controller('stops')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stopsService.getStopById(id);
  }
}
