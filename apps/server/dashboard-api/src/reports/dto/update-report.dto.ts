import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ReportStatus, IncidentPriority } from '../../common/enums'
export class UpdateReportDto {
  @IsString() @IsOptional() title?: string
  @IsString() @IsOptional() content?: string
  @IsEnum(ReportStatus) @IsOptional() status?: ReportStatus
  @IsEnum(IncidentPriority) @IsOptional() priority?: IncidentPriority
  @IsString() @IsOptional() resolutionNote?: string
}
