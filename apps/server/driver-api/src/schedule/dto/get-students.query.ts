import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TripType, DayPart } from '../../trip/trip.enums';

export class GetStudentsQueryDto {
  @IsEnum(TripType)
  shift: TripType; // 'pickup' | 'dropoff'

  @IsOptional()
  @IsEnum(DayPart)
  session?: DayPart; // 'morning' | 'afternoon' (nếu không truyền sẽ map theo shift)

  @IsOptional()
  @IsDateString()
  date?: string; // YYYY-MM-DD (mặc định: hôm nay)
}
