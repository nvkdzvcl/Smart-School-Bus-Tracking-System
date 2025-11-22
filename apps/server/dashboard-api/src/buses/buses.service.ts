import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bus } from './bus.entity'

@Injectable()
export class BusesService {
  constructor(@InjectRepository(Bus) private repo: Repository<Bus>) {}

  findAll() { return this.repo.find() }

  async findOne(id: string) {
    const bus = await this.repo.findOne({ where: { id } })
    if (!bus) throw new NotFoundException('Bus not found')
    return bus
  }

  create(data: Partial<Bus>) { return this.repo.save(this.repo.create(data)) }

  async update(id: string, data: Partial<Bus>) {
    const bus = await this.findOne(id)
    Object.assign(bus, data)
    return this.repo.save(bus)
  }

  async remove(id: string) {
    const bus = await this.findOne(id)
    await this.repo.remove(bus)
    return { deleted: true }
  }
}
