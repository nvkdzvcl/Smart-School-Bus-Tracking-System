import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator'
export class SendMessageDto {
  @IsUUID() senderId: string
  @IsUUID() recipientId: string
  @IsString() @IsNotEmpty() content: string
  @IsUUID() @IsOptional() conversationId?: string
}
