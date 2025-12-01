import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsDateString } from 'class-validator'
export class CreateBusDto {
  @IsString() @IsNotEmpty() licensePlate: string
  @IsInt() @Min(1) capacity: number
  @IsString() @IsOptional() gpsDeviceId?: string
  @IsDateString() @IsOptional() insuranceExpiry?: string
}
