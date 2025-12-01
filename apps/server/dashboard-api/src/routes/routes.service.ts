import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Route } from './route.entity'
import { RouteStop } from './route-stop.entity'
import { Stop } from '../stops/stops.entity'

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route) private routeRepo: Repository<Route>,
    @InjectRepository(RouteStop) private rsRepo: Repository<RouteStop>,
    @InjectRepository(Stop) private stopRepo: Repository<Stop>,
  ) { }

  findAll() {
    return this.routeRepo.find({ relations: ['stops', 'stops.stop'] })
  }

  async findOne(id: string) {
    const route = await this.routeRepo.find({ where: { id }, relations: ['stops', 'stops.stop'] })
    if (!route || route.length === 0) throw new NotFoundException('Route not found')
    return route[0]
  }

  async create(data: { name: string; description?: string; status?: string; stopIds?: string[] }) {
    if (!data.name) throw new BadRequestException('Route name required')
    const route = this.routeRepo.create({ name: data.name, description: data.description, status: (data.status || 'active') })
    const saved = await this.routeRepo.save(route)
    if (data.stopIds?.length) {
      let order = 1
      for (const sid of data.stopIds) {
        await this.rsRepo.save({ routeId: saved.id, stopId: sid, stopOrder: order++ })
      }
    }
    return this.findOne(saved.id)
  }

  async update(id: string, data: { name?: string; description?: string; status?: string; stopIds?: string[] }) {
    const route = await this.routeRepo.findOne({ where: { id } })
    if (!route) throw new NotFoundException('Route not found')
    if (data.name !== undefined) route.name = data.name!
    if (data.description !== undefined) route.description = data.description!
    if (data.status !== undefined) route.status = data.status!
    await this.routeRepo.save(route)
    if (data.stopIds) {
      await this.rsRepo.delete({ routeId: id })
      let order = 1
      for (const sid of data.stopIds) {
        await this.rsRepo.save({ routeId: id, stopId: sid, stopOrder: order++ })
      }
    }
    return this.findOne(id)
  }

  async remove(id: string) {
    const route = await this.routeRepo.findOne({ where: { id } })
    if (!route) throw new NotFoundException('Route not found')
    await this.routeRepo.remove(route)
    return { deleted: true }
  }
}
