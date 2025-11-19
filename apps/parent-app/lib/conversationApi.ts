import apiClient from "./api";

/**
 * Lấy danh sách các cuộc hội thoại của một user.
 * API: GET /api/conversations/user/:userId
 */
export async function getConversationsByUserId(userId: string) {
  return await apiClient.get(`/conversations/user/${userId}`);
}