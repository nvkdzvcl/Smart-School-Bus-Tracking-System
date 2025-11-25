import { IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator'
import { TripStatus } from '../../common/enums'
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
}
