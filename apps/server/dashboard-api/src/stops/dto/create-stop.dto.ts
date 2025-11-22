import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
export class CreateStopDto {
  @IsString() @IsNotEmpty() name: string
  @IsString() @IsOptional() address?: string
  @IsNumber({ maxDecimalPlaces: 6 }) latitude: number
  @IsNumber({ maxDecimalPlaces: 6 }) longitude: number
}
