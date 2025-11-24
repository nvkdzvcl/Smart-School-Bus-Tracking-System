import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Stop } from './stops.entity'
import { CreateStopDto } from './dto/create-stop.dto'
import { UpdateStopDto } from './dto/update-stop.dto'

@Injectable()
export class StopsService {
  constructor(@InjectRepository(Stop) private repo: Repository<Stop>) {}
  findAll() { return this.repo.find() }
  async findOne(id: string) { const item = await this.repo.findOne({ where: { id } }); if (!item) throw new NotFoundException('Stop not found'); return item }
  create(data: CreateStopDto) { return this.repo.save(this.repo.create(data)) }
  async update(id: string, data: UpdateStopDto) { const s = await this.findOne(id); Object.assign(s, data); return this.repo.save(s) }
  async remove(id: string) { const s = await this.findOne(id); await this.repo.remove(s); return { deleted: true } }
}
