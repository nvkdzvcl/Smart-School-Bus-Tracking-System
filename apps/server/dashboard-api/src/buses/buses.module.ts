import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bus } from './bus.entity'
import { BusesService } from './buses.service'
import { BusesController } from './buses.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Bus])],
  providers: [BusesService],
  controllers: [BusesController],
  exports: [BusesService],
})
export class BusesModule {}
