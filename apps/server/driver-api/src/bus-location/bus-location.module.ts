import { Module } from '@nestjs/common';
import { BusLocationService } from './bus-location.service';
import { BusLocationController } from './bus-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusLocation } from './entities/bus-location.entity';
import { RealtimeModule } from 'src/realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([BusLocation]), RealtimeModule],
  controllers: [BusLocationController],
  providers: [BusLocationService],
})
export class BusLocationModule {}
