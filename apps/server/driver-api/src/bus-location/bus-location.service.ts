// bus-location.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusLocation } from './entities/bus-location.entity';
import { TrackingGateway } from 'src/realtime/tracking.gateway';

@Injectable()
export class BusLocationService {
  constructor(
    @InjectRepository(BusLocation)
    private repo: Repository<BusLocation>,
    private trackingGateway: TrackingGateway,
  ) {}
}
