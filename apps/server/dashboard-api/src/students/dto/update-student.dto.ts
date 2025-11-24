import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator'

export class UpdateStudentDto {
  @IsString() @IsOptional() fullName?: string
  @IsUUID() @IsOptional() parentId?: string
  @IsUUID() @IsOptional() pickupStopId?: string
  @IsUUID() @IsOptional() dropoffStopId?: string
  @IsString() @IsOptional() class?: string
  @IsEnum(['active', 'inactive']) @IsOptional() status?: 'active' | 'inactive'
  @IsUUID() @IsOptional() routeId?: string
}
