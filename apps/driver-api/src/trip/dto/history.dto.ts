import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetHistoryQueryDto {
  @IsOptional() @IsString() from?: string; // yyyy-mm-dd
  @IsOptional() @IsString() to?: string;   // yyyy-mm-dd

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit: number = 10;
}
