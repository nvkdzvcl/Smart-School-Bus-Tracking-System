import { IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator'
import { TripStatus, TripType, DayPart } from '../../common/enums'
export class UpdateTripDto {
    @IsOptional()
    @IsUUID()
    routeId?: string

    @IsOptional()
    @IsUUID()
    busId?: string

    @IsOptional()
    @IsUUID()
    driverId?: string

    @IsOptional()
    @IsEnum(TripStatus)
    status?: TripStatus

    @IsOptional()
    @IsDateString()
    actualStartTime?: string

    @IsOptional()
    @IsDateString()
    actualEndTime?: string

    // Optional fields for updating schedule
    @IsOptional()
    @IsDateString()
    tripDate?: string

    @IsOptional()
    @IsEnum(DayPart)
    session?: DayPart

    @IsOptional()
    @IsEnum(TripType)
    type?: TripType
}
