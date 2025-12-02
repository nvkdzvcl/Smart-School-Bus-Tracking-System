// create-conversation.dto.ts
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsUUID()
  partnerId: string; // ID của người muốn chat cùng
}
