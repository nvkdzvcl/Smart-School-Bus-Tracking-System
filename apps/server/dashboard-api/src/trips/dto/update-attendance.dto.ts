import { IsEnum } from 'class-validator'
import { AttendanceStatus } from '../../common/enums'
export class UpdateAttendanceDto {
    @IsEnum(AttendanceStatus) status: AttendanceStatus
}
