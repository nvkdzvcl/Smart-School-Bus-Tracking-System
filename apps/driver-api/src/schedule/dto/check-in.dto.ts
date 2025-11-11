// apps/driver-api/src/schedule/dto/check-in.dto.ts
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string; // FE sẽ gửi lên ID của học sinh
}