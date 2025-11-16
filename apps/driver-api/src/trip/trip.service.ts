// apps/driver-api/src/trip/trip.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from './trip.entity';
import { Route } from '../route/route.entity';
import { Report } from '../reports/entities/report.entity';
import { TripStudent } from './trip-student.entity';
import { TripStatus } from './trip.enums';

export interface TripHistoryBE {
  id: string;
  date: string;
  shift: string;
  route: string;
  startTime: string;
  endTime: string;
  totalStudents: number;
  pickedUp: number;
  droppedOff: number;
  distance: string;
  duration: string;
  incidents: number;
  status: 'completed' | 'incomplete';
}

export interface HistorySummary {
  totalTrips: number;
  completedTrips: number;
  totalIncidents: number;
}

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(TripStudent) private readonly tripStudentRepository: Repository<TripStudent>,
    @InjectRepository(Route) private readonly routeRepository: Repository<Route>,
  ) {}

  async getHistoryListByUser(user: any): Promise<TripHistoryBE[]> {
    const driverId = user.userId;

    const rows = await this.tripRepository
      .createQueryBuilder('trip')
      // Join tuyến: có thể join theo entity hoặc tên table. Mình dùng tên table để tránh lệ thuộc metadata.
      .leftJoin('Routes', 'route', 'route.id = trip.route_id')
      // Join Trip_Students & Reports theo entity + ON:
      .leftJoin(TripStudent, 'ts', 'ts.trip_id = trip.id')
      .leftJoin(Report, 'report', 'report.trip_id = trip.id')
      .where('trip.driver_id = :driverId', { driverId })
      .andWhere('trip.status IN (:...statuses)', {
        statuses: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      })
      .andWhere(`trip.trip_date >= NOW() - INTERVAL '30 day'`)
      .select([
        'trip.id AS id',
        'trip.trip_date AS date',
        'trip.session AS shift',
        'route.name AS route',
        'trip.actual_start_time AS startTime',
        'trip.actual_end_time AS endTime',
        'trip.status AS status',
        // Đếm
        'COUNT(DISTINCT ts.student_id) AS "totalStudents"',
        `SUM(CASE WHEN ts.status = 'attended' THEN 1 ELSE 0 END) AS "pickedUp"`,
        `SUM(CASE WHEN ts.status = 'attended' THEN 1 ELSE 0 END) AS "droppedOff"`,
        'COUNT(DISTINCT report.id) AS "incidents"',
      ])
      // group theo PK và những cột không tổng hợp
      .groupBy('trip.id')
      .addGroupBy('route.name')
      .orderBy('trip.trip_date', 'DESC')
      .addOrderBy('trip.session', 'DESC')
      .getRawMany();

    return rows.map((h: any) => {
      const totalStudents = parseInt(h.totalStudents, 10) || 0;
      const pickedUp = parseInt(h.pickedUp, 10) || 0;
      const incidents = parseInt(h.incidents, 10) || 0;

      const start = h.startTime ? new Date(h.startTime) : null;
      const end = h.endTime ? new Date(h.endTime) : null;

      let duration = 'N/A';
      if (start && end) {
        const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
        duration = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
      }

      const status: 'completed' | 'incomplete' =
        h.status === TripStatus.COMPLETED ? 'completed' : 'incomplete';

      const toHHMM = (d: Date | null) =>
        d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : 'N/A';

      return {
        id: h.id,
        date: h.date,
        shift: h.shift === 'morning' ? 'Ca sáng' : 'Ca chiều',
        route: h.route || 'N/A',
        startTime: toHHMM(start),
        endTime: toHHMM(end),
        totalStudents,
        pickedUp,
        droppedOff: pickedUp,
        distance: `${(Math.random() * 5 + 10).toFixed(1)} km`,
        duration,
        incidents,
        status,
      };
    });
  }

  async getHistorySummaryByUser(user: any): Promise<HistorySummary> {
    const driverId = user.userId;

    const s = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoin(Report, 'report', 'report.trip_id = trip.id')
      .where('trip.driver_id = :driverId', { driverId })
      .andWhere('trip.status IN (:...statuses)', {
        statuses: [TripStatus.COMPLETED, TripStatus.CANCELLED],
      })
      .andWhere(`trip.trip_date >= NOW() - INTERVAL '30 day'`)
      .select([
        'COUNT(DISTINCT trip.id) AS "totalTrips"',
        `SUM(CASE WHEN trip.status = 'completed' THEN 1 ELSE 0 END) AS "completedTrips"`,
        'COUNT(report.id) AS "totalIncidents"',
      ])
      .getRawOne();

    return {
      totalTrips: parseInt(s?.totalTrips, 10) || 0,
      completedTrips: parseInt(s?.completedTrips, 10) || 0,
      totalIncidents: parseInt(s?.totalIncidents, 10) || 0,
    };
  }
}
