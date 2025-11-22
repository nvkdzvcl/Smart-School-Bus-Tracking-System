import { IsUUID, IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'
import { NotificationType } from '../../common/enums'
export class CreateNotificationDto {
  @IsUUID() recipientId: string
  @IsString() @IsOptional() title?: string
  @IsString() @IsNotEmpty() message: string
  @IsEnum(NotificationType) type: NotificationType
}
