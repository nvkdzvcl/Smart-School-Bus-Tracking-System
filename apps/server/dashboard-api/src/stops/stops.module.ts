import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Stop } from './stops.entity'
import { StopsService } from './stops.service'
import { StopsController } from './stops.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Stop])],
  providers: [StopsService],
  controllers: [StopsController],
  exports: [StopsService],
})
export class StopsModule {}
