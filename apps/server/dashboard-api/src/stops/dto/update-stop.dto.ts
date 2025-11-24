import { IsString, IsOptional, IsNumber } from 'class-validator'
export class UpdateStopDto {
  @IsString() @IsOptional() name?: string
  @IsString() @IsOptional() address?: string
  @IsNumber({ maxDecimalPlaces: 6 }) @IsOptional() latitude?: number
  @IsNumber({ maxDecimalPlaces: 6 }) @IsOptional() longitude?: number
}
