// apps/driver-api/src/reports/dto/create-report.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '../report.enums';

export class CreateReportDto {
  @ApiProperty({
    description: 'Tiêu đề của báo cáo',
    example: 'Học sinh vắng mặt',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Nội dung chi tiết của báo cáo',
    example: 'Học sinh Nguyễn Văn An không có mặt tại điểm đón.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Loại báo cáo',
    enum: ReportType,
    example: ReportType.STUDENT_ABSENT,
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @ApiPropertyOptional({
    description: 'ID của học sinh (nếu báo cáo liên quan)',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;
}