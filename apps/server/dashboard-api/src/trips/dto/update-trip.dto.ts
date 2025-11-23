import { IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator'
import { TripStatus } from '../../common/enums'
export class UpdateTripDto {
    @IsUUID() @IsOptional() routeId?: string
    @IsUUID() @IsOptional() busId?: string
    @IsUUID() @IsOptional() driverId?: string
    @IsEnum(TripStatus) @IsOptional() status?: TripStatus
    @IsDateString() @IsOptional() actualStartTime?: string
    @IsDateString() @IsOptional() actualEndTime?: string
}
