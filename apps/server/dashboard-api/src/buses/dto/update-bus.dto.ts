import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator'
import { BusStatus } from '../../common/enums'
export class UpdateBusDto {
  @IsString() @IsOptional() licensePlate?: string
  @IsInt() @Min(1) @IsOptional() capacity?: number
  @IsEnum(BusStatus) @IsOptional() status?: BusStatus
}
