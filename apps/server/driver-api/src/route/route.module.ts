import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './route.entity';
import { RouteStop } from './route-stop.entity';
import { Stop } from './stop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route, Stop, RouteStop])],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
