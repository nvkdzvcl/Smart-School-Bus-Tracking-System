import { IsString, IsNotEmpty, IsArray, IsUUID, ArrayUnique, IsOptional } from 'class-validator'

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  @IsOptional()
  stopIds?: string[]

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive'
}
