import apiClient from "./api";

export async function getMyChildrenToday(parentId: string) {
  return await apiClient.get(`/students/${parentId}/today`);
}
