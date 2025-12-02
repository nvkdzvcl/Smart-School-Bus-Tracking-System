// bus-location.controller.ts
import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { BusLocationService } from './bus-location.service';

@Controller('trips/:tripId/locations')
export class BusLocationController {
  constructor(private service: BusLocationService) {}
}
