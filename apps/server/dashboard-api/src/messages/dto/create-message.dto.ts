import { IsUUID, IsNotEmpty, IsString } from 'class-validator'

export class CreateMessageDto {
    @IsUUID() @IsNotEmpty() conversationId: string
    @IsUUID() @IsNotEmpty() senderId: string
    @IsUUID() @IsNotEmpty() recipientId: string
    @IsString() @IsNotEmpty() content: string
}