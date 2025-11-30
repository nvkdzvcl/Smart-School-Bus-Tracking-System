import { IsString, IsOptional, IsArray, IsUUID, ArrayUnique, IsIn } from 'class-validator'

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: string

  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  @IsOptional()
  stopIds?: string[]
}
