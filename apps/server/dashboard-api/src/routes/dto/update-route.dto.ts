import { IsString, IsOptional, IsArray, IsUUID, ArrayUnique } from 'class-validator'

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive'

  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  @IsOptional()
  stopIds?: string[]
}
