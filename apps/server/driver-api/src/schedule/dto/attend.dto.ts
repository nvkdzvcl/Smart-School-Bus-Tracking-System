import { IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { TripType, DayPart } from '../../trip/trip.enums';

export class AttendBodyDto {
  @IsUUID()
  studentId: string;
}

export class AttendQueryDto {
  @IsEnum(TripType)
  shift: TripType;

  @IsOptional()
  @IsEnum(DayPart)
  session?: DayPart;

  @IsOptional()
  @IsDateString()
  date?: string;
}
