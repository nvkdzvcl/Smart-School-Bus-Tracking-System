import type { CreateMessageDto } from '@/types/data-types';
import apiClient from './api';

// Gửi tin nhắn mới
export async function createMessage(data: CreateMessageDto) {
  return await apiClient.post('/messages', data);
}

// Lấy tin nhắn theo recipientId
export async function getMessagesByRecipientId(id: string) {
  return await apiClient.get(`/messages/recipient/${id}`);
}

// Lấy tin nhắn theo conversationId
export async function getMessagesByConversationId(conversationId: string) {
  return await apiClient.get(`/messages/conversation/${conversationId}`);
}

// export async function getConversations() {
//   return await apiClient.get('/messages/conversations');
// }