import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusLocation } from './bus-location.entity'
import { Trip } from '../trips/trip.entity'

@Injectable()
export class BusLocationsService {
  constructor(
    @InjectRepository(BusLocation) private locRepo: Repository<BusLocation>,
    @InjectRepository(Trip) private tripRepo: Repository<Trip>,
  ) {}

  async recordLocation(data: { tripId: string; latitude: string; longitude: string }) {
    const trip = await this.tripRepo.findOne({ where: { id: data.tripId } })
    if (!trip) throw new NotFoundException('Trip not found')
    return this.locRepo.save(this.locRepo.create({ trip, latitude: data.latitude, longitude: data.longitude }))
  }

  async latestForTrip(tripId: string) {
    const loc = await this.locRepo.find({ where: { trip: { id: tripId } }, order: { timestamp: 'DESC' }, take: 1 })
    if (!loc.length) throw new NotFoundException('No locations for trip')
    return loc[0]
  }

  historyForTrip(tripId: string, limit = 100) {
    return this.locRepo.find({ where: { trip: { id: tripId } }, order: { timestamp: 'DESC' }, take: limit })
  }
}
