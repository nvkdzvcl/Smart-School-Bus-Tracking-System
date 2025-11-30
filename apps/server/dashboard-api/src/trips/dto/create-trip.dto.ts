import { IsUUID, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator'
import { TripType, DayPart } from '../../common/enums'
export class CreateTripDto {
    @IsOptional()
    @IsUUID()
    routeId?: string

    @IsOptional()
    @IsUUID()
    busId?: string

    @IsOptional()
    @IsUUID()
    driverId?: string

    @IsDateString() tripDate: string
    @IsEnum(DayPart) session: DayPart
    @IsEnum(TripType) type: TripType

    @IsOptional()
    @IsDateString()
    plannedStartTime?: string

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    studentIds?: string[]
}
