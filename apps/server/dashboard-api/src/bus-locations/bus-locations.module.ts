import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BusLocation } from './bus-location.entity'
import { Trip } from '../trips/trip.entity'
import { BusLocationsService } from './bus-locations.service'
import { BusLocationsController } from './bus-locations.controller'

@Module({
  imports: [TypeOrmModule.forFeature([BusLocation, Trip])],
  providers: [BusLocationsService],
  controllers: [BusLocationsController],
  exports: [BusLocationsService],
})
export class BusLocationsModule {}
