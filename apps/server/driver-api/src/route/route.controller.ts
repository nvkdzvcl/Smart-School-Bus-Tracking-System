import { Controller, Get, Param } from '@nestjs/common';
import { RouteService } from './route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routesService: RouteService) {}

  @Get(':routeId/stops')
  async getRouteStops(@Param('routeId') routeId: string) {
    return this.routesService.getStopsByRoute(routeId);
  }
}
