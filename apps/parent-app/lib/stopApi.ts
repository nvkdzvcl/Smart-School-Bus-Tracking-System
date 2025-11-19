import apiClient from "./api";

export async function getStopById(id: string) {
  return await apiClient.get(`/stops/${id}`);
}
