import { IsUUID, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator'
import { TripType, DayPart } from '../../common/enums'
export class CreateTripDto {
    @IsUUID() @IsOptional() routeId?: string
    @IsUUID() @IsOptional() busId?: string
    @IsUUID() @IsOptional() driverId?: string
    @IsDateString() tripDate: string
    @IsEnum(DayPart) session: DayPart
    @IsEnum(TripType) type: TripType
    @IsArray() @IsUUID('4', { each: true }) @IsOptional() studentIds?: string[]
}
