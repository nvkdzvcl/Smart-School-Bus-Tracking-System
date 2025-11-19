import { Module } from '@nestjs/common';
import { StopsService } from './stops.service';
import { StopsController } from './stops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stop } from 'src/route/stop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stop])],
  controllers: [StopsController],
  providers: [StopsService],
})
export class StopsModule {}
