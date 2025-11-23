import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Route } from './route.entity'
import { RouteStop } from './route-stop.entity'
import { Stop } from '../stops/stops.entity'
import { RoutesService } from './routes.service'
import { RoutesController } from './routes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Route, RouteStop, Stop])],
  providers: [RoutesService],
  controllers: [RoutesController],
  exports: [RoutesService],
})
export class RoutesModule {}
