import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator'

export class SendNotificationDto {
    @IsString() @IsNotEmpty() title: string
    @IsString() @IsNotEmpty() content: string
    @IsIn(['normal', 'important', 'urgent']) priority: 'normal' | 'important' | 'urgent'
    @IsIn(['all', 'drivers', 'parents']) targetGroup: 'all' | 'drivers' | 'parents'
    @IsOptional() @IsString() senderId?: string
}
