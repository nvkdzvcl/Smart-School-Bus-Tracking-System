import { IsUUID, IsNumber } from 'class-validator'
export class RecordLocationDto {
  @IsUUID() tripId: string
  @IsNumber({ maxDecimalPlaces: 6 }) latitude: number
  @IsNumber({ maxDecimalPlaces: 6 }) longitude: number
}
