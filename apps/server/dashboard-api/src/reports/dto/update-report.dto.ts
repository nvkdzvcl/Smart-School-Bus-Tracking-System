import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ReportStatus } from '../../common/enums'
export class UpdateReportDto {
  @IsString() @IsOptional() title?: string
  @IsString() @IsOptional() content?: string
  @IsEnum(ReportStatus) @IsOptional() status?: ReportStatus
}
