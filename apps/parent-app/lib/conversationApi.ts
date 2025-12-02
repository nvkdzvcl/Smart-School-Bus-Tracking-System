import apiClient from "./api";

/**
 * Lấy danh sách các cuộc hội thoại của một user.
 * API: GET /api/conversations/user/:userId
 */
export async function getConversationsByUserId(userId: string) {
  return await apiClient.get(`/conversations/user/${userId}`);
}

export const createConversation = async (partnerId: string) => {
  return apiClient.post(`/conversations`, { partnerId });
};

export async function getOrCreateConversation(
  participant1Id: string,
  participant2Id: string,
) {
  return await apiClient.post('/conversations/get-or-create', {
    participant1Id,
    participant2Id,
  });
}
