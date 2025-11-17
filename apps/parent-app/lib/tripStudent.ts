import apiClient from "./api";

export async function getRecentAttendance(id: string, limit: number) {
  return await apiClient.get(`/trip-student/recent/${id}`, {
    params: { limit },
  });
}
