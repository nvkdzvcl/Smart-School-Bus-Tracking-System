import { IsString, IsOptional, IsEnum, IsUUID, IsNotEmpty } from 'class-validator'

export class CreateStudentDto {
  @IsString() @IsNotEmpty() fullName: string
  @IsUUID() @IsOptional() parentId?: string
  @IsUUID() @IsOptional() pickupStopId?: string
  @IsUUID() @IsOptional() dropoffStopId?: string
  @IsString() @IsOptional() class?: string
  @IsEnum(['active', 'inactive']) @IsOptional() status?: 'active' | 'inactive'
  @IsUUID() @IsOptional() routeId?: string
}
