import apiClient from "./api";

export async function getNotificationsByUserId(id: string) {
  return await apiClient.get(`/notifications/users/${id}`);
}
