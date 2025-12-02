import { IsUUID, IsNotEmpty } from 'class-validator';
export class GetOrCreateConversationDto {
  @IsUUID() @IsNotEmpty() userAId: string;
  @IsUUID() @IsNotEmpty() userBId: string;
}
