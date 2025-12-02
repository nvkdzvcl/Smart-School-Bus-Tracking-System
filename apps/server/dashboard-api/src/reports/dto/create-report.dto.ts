import { IsUUID, IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'
import { ReportType, IncidentPriority } from '../../common/enums'
export class CreateReportDto {
    @IsUUID() @IsOptional() senderId?: string
    @IsUUID() @IsOptional() tripId?: string
    @IsUUID() @IsOptional() studentId?: string
    @IsString() @IsNotEmpty() title: string
    @IsString() @IsNotEmpty() content: string
    @IsEnum(ReportType) type: ReportType
    @IsString() @IsOptional() imageUrl?: string
    @IsEnum(IncidentPriority) @IsOptional() priority?: IncidentPriority
    @IsString() @IsOptional() resolutionNote?: string
}
