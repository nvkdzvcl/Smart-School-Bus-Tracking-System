import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator'
export class CreateBusDto {
  @IsString() @IsNotEmpty() licensePlate: string
  @IsInt() @Min(1) capacity: number
}
