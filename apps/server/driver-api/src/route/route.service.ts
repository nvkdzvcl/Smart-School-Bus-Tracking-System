import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './route.entity';
import { Repository } from 'typeorm';
import { RouteStop } from './route-stop.entity';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,

    @InjectRepository(RouteStop)
    private readonly routeStopRepo: Repository<RouteStop>,
  ) {}


  /**
   * GET /routes/:routeId/stops
   * Trả về danh sách điểm dừng theo đúng format FE cần
   */
  async getStopsByRoute(routeId: string) {
    // 1️⃣ Kiểm tra route có tồn tại
    const route = await this.routeRepo.findOne({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // 2️⃣ Lấy danh sách Route_Stops + join Stop
    const routeStops = await this.routeStopRepo.find({
      where: { routeId },
      relations: ['stop'], // load bảng Stops
      order: { stopOrder: 'ASC' },
    });

    // 3️⃣ Map lại đúng format FE đang dùng
    return routeStops.map((rs) => ({
      stop_id: rs.stopId,
      stop_order: rs.stopOrder,
      stop: {
        id: rs.stop.id,
        name: rs.stop.name,
        address: rs.stop.address,
        latitude: rs.stop.latitude,
        longitude: rs.stop.longitude,
      },
    }));
  }
}
